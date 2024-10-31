'use server'

import axios from "axios"
import * as cheerio from 'cheerio'
import { v4 as uuidv4 } from 'uuid'

import { redirect } from 'next/navigation'

import { createClient } from "./supabase/server";
import { headers } from "next/headers"


export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  redirect('/')
}

export async function socialAuth() {

  const o = await headers()
  const origin = o.get('origin')

  if (origin) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // redirectTo: `https://nav-gov-docs.vercel.app/auth/callback`,
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      },
    })

    if (data.url) {
      redirect(data.url) // use the redirect API for your server framework
    }
  }

}

export async function getNavDocsData(originalFilename) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('nav-docs')
    .select('doc_original_name')
    .eq('doc_original_name', originalFilename)

  if (error) {
    throw new Error('Error get nav docs')
  }
  return data
}

// export async function getAllNavDocsFromBucket() {
//   const supabase = await createClient()
//   const { data, error } = await supabase.storage
//     .from('nav-gov-docs')
//     .list()
//   if (error) {
//     throw new Error('Error get nav docs')
//   }
//   return data
// }

export async function getMainFolders() {

  const supabase = await createClient()
  let { data, error } = await supabase.rpc('distinct_doc_years')

  if (error) {
    console.log(error);
    throw new Error('Error get nav docs')
  }

  return { mainFolders: data }
}

export async function getSubfolders(mainFolderSlug) {

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('distinct_group_titles_by_year', {
    p_doc_year: mainFolderSlug
  })

  if (error) {
    console.log(error);
    throw new Error('Error get nav docs')
  }
  return { subFolders: data }
}

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
          // const urlData = []

          const urlData = await Promise.all(
            links.map(async (_, link) => {
              const response = await getNavDocsData($(link).text())
              // console.log("létezik e már? ", response);
              return {
                urlTitle: $(link).text(),
                url: `https://nav.gov.hu${$(link).attr('href')}`,
                isExistInDB: response.length > 0 ? true : false
              }
              // urlData.push({
              //   urlTitle: $(link).text(),
              //   url: `https://nav.gov.hu${$(link).attr('href')}`
              // })
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

export async function uploadDoc({ docData, groupTitle, newNavDocSlug }) {

  const { urlTitle, url } = docData
  const { data } = await axios.get(url, { responseType: 'arraybuffer' })
  const pdfBlob = new Blob([data], { type: 'application/pdf' })
  const supabase = await createClient()
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

  if (newNavDocSlug.length > 4) {
    const slicedYear = newNavDocSlug.slice(-4)
    const { data, error } = await supabase.storage
      .from('nav-gov-docs')
      .upload(`${slicedYear}/${folderName}/${fileName}`, pdfBlob, {
        contentType: 'application/pdf',
      })

    const { id, path } = data
    const response = await supabase.from('nav-docs').insert({ doc_id: id, doc_path: path, doc_original_name: urlTitle, doc_year: slicedYear, group_title: groupTitle, subfolder: folderName })

    if (error || response.error) {
      console.log(error);
      console.log(response.error);
      throw new Error('Error uploading document')
    }

    return { message: "A fizet feltölve" }

  } else { newNavDocSlug.length === 4 } {
    const year = newNavDocSlug
    const { data, error } = await supabase.storage
      .from('nav-gov-docs')
      .upload(`${year}/${folderName}/${fileName}`, pdfBlob, {
        contentType: 'application/pdf',
      })

    const { id, path } = data
    const response = await supabase.from('nav-docs').insert({ doc_id: id, doc_path: path, doc_original_name: urlTitle, doc_year: year, group_title: groupTitle, subfolder: folderName })

    if (error || response.error) {
      console.log(error);
      console.log(response.error);
      throw new Error('Error uploading document')
    }
    return { message: "A fizet feltölve" }
  }
}

export async function getInformationBooklets(params) {

  const { mainFolderSlug, subfolderSlug } = params

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_docs_by_year_and_subfolder', {
    p_doc_year: mainFolderSlug,
    p_subfolder: subfolderSlug
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

export async function getSignedUrl(docPath) {

  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from('nav-gov-docs')
    .createSignedUrl(`${docPath}`, 60)
  if (error) {
    throw new Error('Error get nav docs')
  }
  return data


}
