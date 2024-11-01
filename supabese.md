CREATE TABLE
  nav_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    storage_object_id UUID NOT NULL,
    doc_path TEXT NOT NULL,
    doc_original_name TEXT NOT NULL,
    doc_group_title TEXT NOT NULL,
    doc_main_folder TEXT NOT NULL,
    doc_subfolders TEXT NOT NULL,
    embedded BOOLEAN DEFAULT FALSE NOT NULL,
    FOREIGN KEY (created_by) REFERENCES auth.users (id),
    FOREIGN KEY (storage_object_id) REFERENCES nav_documents (id)
  );

CREATE POLICY "Enable insert for authenticated users only"
  ON "public"."nav_documents"
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Enable select for authenticated users only"
  ON "public"."nav_documents"
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Enable update for authenticated users only"
  ON "public"."nav_documents"
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Enable delete for authenticated users only"
  ON "public"."nav_documents"
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (TRUE);

  <!-- ------------------------------------------------- -->

  CREATE TABLE
  nav_document_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    doc_id UUID NOT NULL,
    content TEXT NOT NULL,
    embedding vector (1536) NOT NULL, -- Itt 384 a vektor dimenziója, módosítsd, ha szükséges
    FOREIGN KEY (doc_id) REFERENCES nav_documents (id)
  );

CREATE POLICY "Enable insert for authenticated users only"
  ON "public"."nav_document_sections"
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Enable select for authenticated users only"
  ON "public"."nav_document_sections"
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Enable update for authenticated users only"
  ON "public"."nav_document_sections"
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Enable delete for authenticated users only"
  ON "public"."nav_document_sections"
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (TRUE);

CREATE POLICY "Allow uploads"
  ON STORAGE.objects  
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'nav_documents'::text);

CREATE POLICY "Allow download"
  ON storage.objects 
  FOR SELECT
  TO authenticated
  USING ((bucket_id = 'nav_documents'::text));

CREATE POLICY "Allow delete"
  ON storage.objects 
  FOR DELETE
  TO authenticated
  USING ((bucket_id = 'nav_documents'::text));

CREATE POLICY "Allow update"
  ON STORAGE.objects  
  FOR UPDATE
  TO authenticated
  WITH CHECK (bucket_id = 'nav_documents'::text);

<!-- --------------- -->

CREATE OR REPLACE FUNCTION get_distinct_main_folders () 
  RETURNS TABLE (doc_main_folder TEXT) AS $$
  BEGIN
      RETURN QUERY
      SELECT DISTINCT "nav_documents".doc_main_folder 
      FROM "nav_documents"
      ORDER BY "nav_documents".doc_main_folder DESC;
  END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION distinct_doc_group_title_by_year (p_doc_main_folder TEXT)
  RETURNS TABLE (doc_group_title TEXT, doc_subfolders TEXT) AS $$
  BEGIN
    RETURN QUERY
    SELECT DISTINCT "nav_documents".doc_group_title, "nav_documents".doc_subfolders
    FROM "nav_documents"
    WHERE "nav_documents".doc_main_folder = p_doc_main_folder
    ORDER BY "nav_documents".doc_group_title ASC;
  END;
$$ LANGUAGE plpgsql;