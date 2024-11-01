'use server'

import axios from "axios"
import * as cheerio from 'cheerio'
import { v4 as uuidv4 } from 'uuid'

import { redirect } from 'next/navigation'

import { createClient } from "./supabase/server";
import { headers } from "next/headers"

// -----LangChain && openAI-------------------------------------------------------------------------------
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf"
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
// import { encoding_for_model } from "tiktoken";
import OpenAI from 'openai';
// -----LangChain && openAI-------------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const openAIApiKey = process.env.OPEN_AI_KEY

const openai = new OpenAI({
  apiKey: openAIApiKey
})

// ------ /main-folders---------------------------------------------------------------------------------------

export async function getMainFolders() {
  const supabase = await createClient()
  let { data, error } = await supabase.rpc('get_distinct_main_folders')
  if (error) {
    console.log(error);
    throw new Error('Error when run get_distinct_main_folders')
  }
  return { mainFolders: data }
}

export async function getSubfolders(mainFolderSlug) {

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('distinct_doc_group_title_by_year', {
    p_doc_main_folder: mainFolderSlug
  })

  console.log("p_doc_main_folder", data);

  if (error) {
    console.log(error);
    throw new Error('Error get nav docs')
  }
  return { subFolders: data }
}

export async function getSignedUrl(docPath) {

  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from('nav_documents')
    .createSignedUrl(`${docPath}`, 60)
  if (error) {
    throw new Error('Error get nav docs')
  }
  return data


}

export async function getInformationBooklets(params) {

  const { mainFolderSlug, subfolderSlug } = params

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_docs_by_year_and_subfolder', {
    p_doc_main_folder: mainFolderSlug,
    p_doc_subfolders: subfolderSlug
  })

  if (error) {
    console.log(error);
    throw new Error('Error get nav docs')
  }

  const dataWithSignedUrl = await Promise.all(
    data.map(async (item) => {
      const { signedUrl } = await getSignedUrl(item.doc_path)
      item.signedUrl = signedUrl
      return item
    })
  )

  return { informationBooklets: dataWithSignedUrl }
}

// ------ /main-folders--------------------------------------------------------------------------------------




// ------ /new-docs------------------------------------------------------------------------------------------

export async function getLinksFromNAVGovToCurrentAndLastYear() {

  const { data } = await axios.get(`${process.env.NAV_GOV_URL}`)
  const $ = cheerio.load(data)
  let NAVGovLinksYears = []
  $('a.heading-info-container').map((_, element) => {
    const hrefYearArr = $(element).attr('href').split('/')
    const hrefYear = hrefYearArr[hrefYearArr.length - 1]

    if (hrefYear.length > 4) {
      const slicedHrefYear = hrefYear.slice(-4)
      const url = `${process.env.NAV_GOV_URL}${$(element).attr('href')}`
      NAVGovLinksYears.push({
        slug: hrefYear,
        year: slicedHrefYear,
        url
      })
    } else if (hrefYear.length === 4) {
      const url = `${process.env.NAV_GOV_URL}${$(element).attr('href')}`
      NAVGovLinksYears.push({
        slug: hrefYear,
        year: hrefYear,
        url
      })
    }

  })

  const CurrentAndLastYear = NAVGovLinksYears.slice(0, 2)

  return CurrentAndLastYear
}

export async function getPdfLinksFromNAVGov(newNavDocSlug) {

  const { data } = await axios.get(`https://nav.gov.hu/ugyfeliranytu/nezzen-utana/inf_fuz/${newNavDocSlug}`)
  const $ = cheerio.load(data)
  let pdfLinksArr = []

  await Promise.all(
    $('div.content-list-elements').map(async (_, element) => {
      if (element.nodeType === 1) {
        const $el = $(element)
        const titles = $el.find('h3.content-list-title')
        const links = $el.find('a')

        if (titles.length > 0) {
          const groupTitle = titles.text()
          const urlData = await Promise.all(
            links.map(async (_, link) => {
              const response = await getNavDocsData($(link).text())
              return {
                urlTitle: $(link).text(),
                url: `https://nav.gov.hu${$(link).attr('href')}`,
                isExistInDB: response.length > 0 ? true : false
              }
            }).get()
          )

          urlData.sort((a, b) => a.isExistInDB - b.isExistInDB)
          pdfLinksArr.push({
            groupTitle: groupTitle,
            urlData: urlData
          });
        }
      }
    }).get()
  )
  pdfLinksArr.sort((a, b) => a.groupTitle.localeCompare(b.groupTitle));
  return pdfLinksArr
}

export async function getNavDocsData(originalFilename) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('nav_documents')
    .select('doc_original_name')
    .eq('doc_original_name', originalFilename)

  if (error) {
    throw new Error('Error get nav docs')
  }
  return data
}

export async function uploadDoc({ docData, groupTitle, newNavDocSlug }) {

  const { urlTitle, url } = docData
  const { data } = await axios.get(url, { responseType: 'arraybuffer' })
  const pdfBlob = new Blob([data], { type: 'application/pdf' })

  const fileName = `${uuidv4()}.pdf`
  let folderName = ""

  switch (groupTitle) {
    case "Személyi jövedelemadó és a foglalkoztatáshoz kapcsolódó járulékok, más közterhek":
      folderName = "szja"
      break;
    case "Társasági adó":
      folderName = "tao"
      break;
    case "Jövedéki adó, vám":
      folderName = "jovedeki-ado"
      break;
    case "Illetékek":
      folderName = "illetekek"
      break;
    case "Eljárási szabályok":
      folderName = "eljarasi-szabalyok"
      break;
    case "Egyéb adónemek, kötelezettségek":
      folderName = "egyeb-adonemek"
      break;
    case "Általános forgalmi adó":
      folderName = "afa"
      break;
    default:
  }

  const supabase = await createClient()

  if (newNavDocSlug.length > 4) {
    const slicedYear = newNavDocSlug.slice(-4)
    const { data, error } = await supabase.storage
      .from('nav_documents')
      .upload(`${slicedYear}/${folderName}/${fileName}`, pdfBlob, {
        contentType: 'application/pdf',
      })
    console.log("data", data);
    const { id, path } = data
    const response = await supabase
      .from('nav_documents')
      .insert({
        storage_object_id: id,
        doc_path: path,
        doc_original_name: urlTitle,
        doc_group_title: groupTitle,
        doc_main_folder: slicedYear,
        doc_subfolders: folderName,
        embedded: false
      })
      .select()

    console.log(response);

    if (error) {
      console.log(error);
      throw new Error('Error uploading document')
    }

    return { message: "A fÜzet feltölve" }

  } else { newNavDocSlug.length === 4 } {
    const year = newNavDocSlug
    const { data, error } = await supabase.storage
      .from('nav_documents')
      .upload(`${year}/${folderName}/${fileName}`, pdfBlob, {
        contentType: 'application/pdf',
      })

    const { id, path } = data
    const response = await supabase
      .from('nav_documents')
      .insert({
        storage_object_id: id,
        doc_path: path,
        doc_original_name: urlTitle,
        doc_group_title: groupTitle,
        doc_main_folder: slicedYear,
        doc_subfolders: folderName,
        embedded: false
      })

    if (error) {
      console.log(error);
      throw new Error('Error uploading document')
    }
    return { message: "A füzet feltölve" }
  }

  // // -----LangChain-------------------------------------------------------------------------------
  // // const loader = new WebPDFLoader(pdfBlob, {
  // //   // required params = ...
  // //   // optional params = ...
  // // });
  // // const docs = await loader.load();
  // // const splitter = new RecursiveCharacterTextSplitter({
  // //   chunkSize: 1000,
  // //   chunkOverlap: 100,
  // // });
  // // function optimizeText(content, index) {
  // //   // const nonAsciiCharacters = content.match(/[^\x00-\x7FáéíóöőúüűÁÉÍÓÖŐÚÜŰ]/g)
  // //   // if (nonAsciiCharacters) {
  // //   //   console.log("Nem ASCII karakterek találhatók a szövegben:", index + 1, "oldal", nonAsciiCharacters);
  // //   // } else {
  // //   //   console.log("Nincsenek nem ASCII karakterek a szövegben.");
  // //   // }
  // //   return content
  // //     .replace(/\d+\n/g, '')                          // Hivatkozásszámok eltávolítása
  // //     .replace(/\n\s+/g, '\n')                          // Üres sorok eltávolítása (új sor után következő szóközök)
  // //     .replace(/\.+/g, '')                              // Csak pontokból álló részek eltávolítása
  // //     .replace(//g, '-')                               // '' karakterek cseréje '-'-re
  // //     .replace(/ \n/g, '\n')                       // Minden szóköz + sortörés cseréje egyszerű sortörésre
  // //     .trim()                                           // Vezető és záró szóközök eltávolítása
  // //     .toLowerCase();                                   // Kisbetűssé alakítás
  // // }
  // // const cleanedDocs = docs.map((doc, index) => {
  // //   const cleanedPage = optimizeText(doc.pageContent, index)
  // //   return { pageContent: cleanedPage, metadata: { loc: doc.metadata.loc } }
  // // });
  // // const cleanedDocs = docs.map((doc, index) => ({
  // //   ...doc,
  // //   pageContent: optimizeText(doc.pageContent, index)
  // // }));
  // // const slicedCleanedDocs = cleanedDocs.slice(2, 3)
  // // const splittedDocs = await splitter.splitDocuments(cleanedDocs);
  // // const cleanedSplittedDocs = splittedDocs.map(doc => {
  // //   return { pageContent: doc.pageContent, metadata: doc.metadata }
  // // })
  // // const slicedSplittedDocs = splittedDocs.slice(0, 3)
  // // const encoder = encoding_for_model('text-embedding-ada-002')
  // // let sumTokens = 0
  // // slicedSplittedDocs.map((doc, index) => {
  // //   const tokens = encoder.encode(doc.pageContent)
  // //   sumTokens = sumTokens + tokens.length
  // // })
  // // const textInput = slicedSplittedDocs[0].pageContent
  // const supabase = await createClient()
  // // const embeddings = new OpenAIEmbeddings({
  // //   apiKey: openAIApiKey, // In Node.js defaults to process.env.OPENAI_API_KEY
  // //   // batchSize: 512, // Default value if omitted is 512. Max is 2048
  // //   model: "text-embedding-3-small",
  // // })
  // // const vectorStore = new SupabaseVectorStore(embeddings, {
  // //   client: supabase,
  // //   tableName: "documents",
  // //   queryName: "match_documents",
  // // })
  // // const response = await vectorStore.addDocuments(slicedSplittedDocs)

  // // -----LangChain-------------------------------------------------------------------------------


  // // -----openAI-------------------------------------------------------------------------------

  // // const openai = new OpenAI({
  // //   apiKey: openAIApiKey
  // // })
  // // const response = await openai.embeddings.create({
  // //   input: textInput,
  // //   model: "text-embedding-3-small"
  // // })

  // // -----openAI-------------------------------------------------------------------------------
}

// ------ /new-docs---------------------------------------------------------------------------------------



// ------ embedding ---------------------------------------------------------------------------------------
// itt kell folytatni
// frontend a z embedding gomb külön komponens legyen
// tiktoken hiba, kezelni kell majd, most kivettem a package.json-ből

export const createDocument = async (docId) => {

  console.log(docId);

  const supabase = await createClient()
  const { data, error: selectError } = await supabase
    .from('documents')
    .select()
    .eq('nav_docs_id', docId)

  // console.log(data);

  if (selectError) {
    console.log("selectError: ", selectError)
    return
  }

  const { data: selectedDoc, error: selectedError } = await supabase
    .from('nav-docs')
    .select()
    .eq('id', docId)

  if (selectedError) {
    console.log(error)
    return
  }

  const { data: downloadedData, error: downloadError } = await supabase.storage
    .from('nav-gov-docs')
    .download(selectedDoc[0].doc_path)


  const loader = new WebPDFLoader(downloadedData, {
    // required params = ...
    // optional params = ...
  });

  const docs = await loader.load()
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  })

  function optimizeText(content, index) {

    // const nonAsciiCharacters = content.match(/[^\x00-\x7FáéíóöőúüűÁÉÍÓÖŐÚÜŰ]/g)

    // if (nonAsciiCharacters) {
    //   console.log("Nem ASCII karakterek találhatók a szövegben:", index + 1, "oldal", nonAsciiCharacters);
    // } else {
    //   console.log("Nincsenek nem ASCII karakterek a szövegben.");
    // }

    return content
      .replace(/\d+\n/g, '')                          // Hivatkozásszámok eltávolítása
      .replace(/\n\s+/g, '\n')                          // Üres sorok eltávolítása (új sor után következő szóközök)
      .replace(/\.+/g, '')                              // Csak pontokból álló részek eltávolítása
      .replace(//g, '-')                               // '' karakterek cseréje '-'-re
      .replace(/ \n/g, '\n')                       // Minden szóköz + sortörés cseréje egyszerű sortörésre
      .trim()                                           // Vezető és záró szóközök eltávolítása
      .toLowerCase();                                   // Kisbetűssé alakítás
  }

  const cleanedDocs = docs.map((doc, index) => {
    const cleanedPage = optimizeText(doc.pageContent, index)
    return { pageContent: cleanedPage, metadata: { loc: doc.metadata.loc } }
  })

  const splittedDocs = await splitter.splitDocuments(cleanedDocs);

  const cleanedSplittedDocs = splittedDocs.map(doc => {
    return doc.pageContent
  })

  const content = cleanedSplittedDocs.slice(2, 4)

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: content,
    encoding_format: "float",
  });

  if (embedding?.data) {
    const documetSections = embedding.data.map((item, index) => {
      return { document_id: data[0].id, content: content[index], embedding: item.embedding }
    })

    // console.log("documetSections: ", documetSections);

    const { error } = await supabase
      .from('document_sections')
      .insert(documetSections)

    if (error) {
      console.log(error);
    }

    if (!error) {

      const { data: updatedDoc, error: updateError } = await supabase
        .from('nav-docs')
        .update({ embedded: true })
        .eq('id', docId)
        .select()
    }

  }

  // console.log("downloadedData", docs[0]);

  return { message: 'succes' }

}

// ------ embedding ---------------------------------------------------------------------------------------




export const generateChatResponse = async (chatMessage) => {

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "egy segítőkész asszisztens vagy." },
        ...chatMessage
      ],
      model: "gpt-4o-mini",
      temperature: 0
    });
    console.log(completion);
    return completion.choices[0].message

  } catch (error) {
    console.log(error);
    return null
  }

}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  redirect('/')
}

export async function socialAuth() {

  // const o = await headers()
  // const origin = o.get('origin')

  // const supabase = await createClient()

  // if (origin) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // redirectTo: `https://nav-gov-docs.vercel.app/auth/callback`,
      redirectTo: `${process.env.BASIC_URL}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    },
  })

  if (data.url) {
    redirect(data.url) // use the redirect API for your server framework
  }
  // }

}


