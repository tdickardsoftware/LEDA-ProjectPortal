-- View: public.leda_fiscal_years

-- DROP VIEW public.leda_fiscal_years;

CREATE OR REPLACE VIEW public.leda_fiscal_years
 AS
 SELECT DISTINCT "fiscalYear"
   FROM maint.leda_maint_seasons
  ORDER BY "fiscalYear";

ALTER TABLE public.leda_fiscal_years
    OWNER TO admin;

