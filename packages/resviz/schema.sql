-- Copyright 2025 Lincoln Institute of Land Policy
-- SPDX-License-Identifier: MIT

--
-- PostgreSQL database dump
--

-- Dumped from database version 14.5
-- Dumped by pg_dump version 14.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.resviz DROP CONSTRAINT IF EXISTS resviz_parameter_id_fkey;
ALTER TABLE IF EXISTS ONLY public.resviz DROP CONSTRAINT IF EXISTS resviz_monitoring_location_id_fkey;
DROP INDEX IF EXISTS public.resviz_geom_loc_idx;
DROP INDEX IF EXISTS public.covjson_time_idx;
DROP INDEX IF EXISTS public.covjson_param_idx;
ALTER TABLE IF EXISTS ONLY public.resviz DROP CONSTRAINT IF EXISTS unique_id;
ALTER TABLE IF EXISTS ONLY public.resviz_stations DROP CONSTRAINT IF EXISTS resviz_stations_monitoring_location_id_key;
ALTER TABLE IF EXISTS ONLY public.resviz DROP CONSTRAINT IF EXISTS resviz_pkey;
ALTER TABLE IF EXISTS ONLY public.resviz_parameters DROP CONSTRAINT IF EXISTS resviz_parameters_parameter_id_key;
ALTER TABLE IF EXISTS public.resviz ALTER COLUMN ogc_fid DROP DEFAULT;
DROP TABLE IF EXISTS public.resviz_stations;
DROP TABLE IF EXISTS public.resviz_parameters;
DROP SEQUENCE IF EXISTS public.resviz_ogc_fid_seq;
DROP TABLE IF EXISTS public.resviz;
DROP EXTENSION IF EXISTS postgis_topology;
DROP EXTENSION IF EXISTS postgis_tiger_geocoder;
DROP EXTENSION IF EXISTS postgis;
DROP EXTENSION IF EXISTS fuzzystrmatch;
DROP SCHEMA IF EXISTS topology;
DROP SCHEMA IF EXISTS tiger_data;
DROP SCHEMA IF EXISTS tiger;
--
-- Name: tiger; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS tiger;


--
-- Name: tiger_data; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA  IF NOT EXISTS tiger_data;


--
-- Name: topology; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA  IF NOT EXISTS topology;


--
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: resviz; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resviz (
    ogc_fid integer NOT NULL,
    id character varying,
    value double precision,
    data_date date,
    parameter_id character(3),
    monitoring_location_id integer
);


--
-- Name: resviz_ogc_fid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.resviz_ogc_fid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: resviz_ogc_fid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.resviz_ogc_fid_seq OWNED BY public.resviz.ogc_fid;


--
-- Name: resviz_parameters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resviz_parameters (
    parameter_id character(3) PRIMARY KEY,
    parameter_name character varying,
    parameter_unit character varying
);


--
-- Name: resviz_stations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resviz_stations (
    monitoring_location_id integer PRIMARY KEY,
    monitoring_location_name character varying,
    site_name character varying,
    state character varying,
    huc08 integer,
    huc06 integer,
    doi_region_num integer,
    doi_region_name character varying,
    doi_region character varying,
    max_capacity integer,
    geom public.geometry(Point,4326)
);


--
-- Name: resviz ogc_fid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resviz ALTER COLUMN ogc_fid SET DEFAULT nextval('public.resviz_ogc_fid_seq'::regclass);


--
-- Data for Name: resviz; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.resviz (ogc_fid, id, value, data_date, parameter_id, monitoring_location_id) FROM stdin;
\.


--
-- Data for Name: resviz_parameters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.resviz_parameters (parameter_name, parameter_id, parameter_unit) FROM stdin;
Lake/Reservoir Storage	raw	acre-feet
Average Lake/Reservoir Storage	avg	acre-feet
10th Percentile Lake/Reservoir Storage	p10	acre-feet
90th Percentile Lake/Reservoir Storage	p90	acre-feet
\.


--
-- Data for Name: resviz_stations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.resviz_stations (monitoring_location_id, monitoring_location_name, site_name, state, huc08, huc06, doi_region_num, doi_region_name, doi_region, max_capacity, geom) FROM stdin;
9	UpperKlamathLake	UPPER KLAMATH LAKE	OR	18010203	180102	10	California - Great Basin	CGB	561838	0101000020E61000004E452A8C2D745EC00000000000204540
1533	BlueMesa	BLUE MESA DAM AND RESERVOIR	CO	14020002	140200	7	Upper Colorado Basin	UCB	827940	0101000020E61000008811C2A38DD55AC0F5B9DA8AFD394340
323	ElephantButteReservoir	ELEPHANT BUTTE DAM AND RESERVOIR	NM	13020211	130202	7	Upper Colorado Basin	UCB	2010900	0101000020E6100000BF4351A04FCC5AC09D11A5BDC1934040
1535	FlamingGorge	FLAMING GORGE DAM AND RESERVOIR	WY	14040106	140401	7	Upper Colorado Basin	UCB	3671100	0101000020E610000054742497FF5A5BC0E92B483316754440
393	LakePowell	LAKE POWELL - GLEN CANYON DAM	AZ	14070006	140700	7	Upper Colorado Basin	UCB	24322000	0101000020E61000009E245D33F9DE5BC0F98381E7DE774240
423	NavajoDam	NAVAJO DAM AND RESERVOIR	NM	14080101	140801	7	Upper Colorado Basin	UCB	1696000	0101000020E6100000F08AE07F2BE75AC02619390B7B664240
410	McPheeDam	MCPHEE DAM AND RESERVOIR	NM	14030002	140300	7	Upper Colorado Basin	UCB	381100	0101000020E6100000DD24068195245BC053EC681CEAC94240
1	AmericanFalls	AMERICAN FALLS DAM AND RESERVOIR	ID	17040206	170402	9	Columbia - Pacific Northwest	CPN	1672590	0101000020E6100000F5673F5244385CC0F92CCF83BB634540
3249	AndersonRanch	ANDERSON RANCH DAM AND RESERVOIR	ID	17050113	170501	9	Columbia - Pacific Northwest	CPN	413100	0101000020E61000002DEC6987BFDC5CC0CE8E54DFF9AD4540
3	CleElum	CLE ELUM DAM AND RESERVOIR	WA	17030001	170300	9	Columbia - Pacific Northwest	CPN	436900	0101000020E610000034F44F70B1445EC015AB06616E9F4740
3272	GrandCoulee	FRANKLIN ROOSEVELT LAKE - GRAND COULEE DAM	WA	17020001	170200	9	Columbia - Pacific Northwest	CPN	5349560	0101000020E61000003ECBF3E0EEBE5DC09A99999999F94740
3278	HungryHorseReservoir	HUNGRY HORSE DAM AND RESERVOIR	MT	17010209	170102	9	Columbia - Pacific Northwest	CPN	3467179	0101000020E61000007D96E7C1DD805CC0AAB9DC60A82B4840
5	JacksonLake	JACKSON LAKE - JACKSON DAM	WY	17040101	170401	9	Columbia - Pacific Northwest	CPN	847000	0101000020E6100000B0FECF61BEA55BC0D11E2FA4C3ED4540
2	CascadeLake	LAKE CASCADE - CASCADE DAM	ID	17050123	170501	9	Columbia - Pacific Northwest	CPN	646646	0101000020E61000001FDB32E02C035DC0344A97FE25434640
8	OwyheeDam	LAKE OWYHEE - OWYHEE DAM	OR	17050110	170501	9	Columbia - Pacific Northwest	CPN	715000	0101000020E61000001AA20A7F864F5DC0BCCB457C27D24540
7	LuckyPeak	LUCKY PEAK LAKE - LUCKY PEAK DAM	ID	17050112	170501	9	Columbia - Pacific Northwest	CPN	264400	0101000020E61000002C82FFAD64035DC09D9D0C8E92C34540
3292	Palisades	PALISADES DAM AND RESERVOIR	ID	17040104	170401	9	Columbia - Pacific Northwest	CPN	1200000	0101000020E6100000F7CC920035CD5BC06FD39FFD48AB4540
3515	LakeHavasu	LAKE HAVASU - PARKER DAM	AZ	15030101	150301	8	Lower Colorado Basin	LCB	619400	0101000020E6100000BE9F1A2FDD885CC06744696FF0254140
3514	LakeMead	LAKE MEAD - HOOVER DAM	AZ	15010005	150100	8	Lower Colorado Basin	LCB	26120000	0101000020E61000008104C58F31AF5CC060764F1E16024240
3513	LakeMohave	LAKE MOHAVE - DAVIS DAM	AZ	15030101	150301	8	Lower Colorado Basin	LCB	1809800	0101000020E6100000EA95B20C71A45CC06FF085C954994140
275	BighornLake	BIGHORN LAKE - YELLOWTAIL DAM	MT	10080010	100800	5	Missouri Basin	MB	1011052	0101000020E6100000FE0E45813EFD5AC0AC5626FC52A74640
287	Calamus	CALAMUS RESERVOIR - VIRGINIA SMITH DAM	NE	10210008	102100	5	Missouri Basin	MB	119469	0101000020E6100000BC9179E40FCE58C06E4C4F58E2E94440
269	CanyonFerry	CANYON FERRY LAKE AND DAM	MT	10030101	100301	5	Missouri Basin	MB	1886950	0101000020E6100000C3F5285C8FEE5BC0ACC5A70018534740
291	ChokeCanyon	CHOKE CANYON DAM AND RESERVOIR	TX	12110108	121101	6	Arkansas - Rio Grande - Texas Gulf	ART	695271	0101000020E61000005BCEA5B8AA8A58C03A0664AF77773C40
294	ClarkCanyon	CLARK CANYON DAM AND RESERVOIR	MT	10020001	100200	5	Missouri Basin	MB	174300	0101000020E61000007B14AE47E1365CC031B1F9B836804640
342	GibsonDam	GIBSON DAM AND RESERVOIR	MT	10030104	100301	5	Missouri Basin	MB	98688	0101000020E610000009168733BF305CC0543A58FFE7CC4740
345	GlendoDam	GLENDO DAM AND RESERVOIR	WY	10180008	101800	5	Missouri Basin	MB	492022	0101000020E6100000B0389CF9D53C5AC0A27F828B153D4540
357	GuernseyDam	GUERNSEY DAM AND RESERVOIR	WY	10180008	101800	5	Missouri Basin	MB	45612	0101000020E6100000CDCCCCCCCC305AC037A6272CF1244540
379	JamestownDam	JAMESTOWN DAM AND RESERVOIR	ND	10160001	101600	5	Missouri Basin	MB	30488	0101000020E61000002C0E677E35AD58C09E7B0F971C774740
390	NortonDam	KEITH SEBELIUS LAKE - NORTON DAM	KS	10250015	102500	5	Missouri Basin	MB	34510	0101000020E6100000E0B9F770C9FB58C08FC2F5285CE74340
391	KirwinDam	KIRWIN DAM AND RESERVOIR	KS	10260011	102600	5	Missouri Basin	MB	98154	0101000020E61000000E4A9869FBC758C037A6272CF1D44340
396	LakeElwell	LAKE ELWELL - TIBER DAM	MT	10030203	100302	5	Missouri Basin	MB	925649	0101000020E6100000B9DFA128D0C55BC0F8AA9509BF284840
475	LakeSherburne	LAKE SHERBURNE - SHERBURNE DAM	MT	9040001	904000	5	Missouri Basin	MB	66147	0101000020E610000096E7C1DD59615CC0D925AAB7066A4840
6	LakeTschida	LAKE TSCHIDA - HEART BUTTE DAM	ND	10130202	101302	5	Missouri Basin	MB	65091	0101000020E6100000C0046EDDCD7359C08E40BCAE5F4C4740
408	McGeeCreek	MCGEE CREEK DAM AND RESERVOIR	OK	11140103	111401	6	Arkansas - Rio Grande - Texas Gulf	ART	113924	0101000020E61000000000000000F857C0F146E6913F284140
433	PathfinderDam	PATHFINDER DAM AND RESERVOIR	WY	10180003	101800	5	Missouri Basin	MB	1070185	0101000020E61000007862D68BA1B65AC06B48DC63E93B4540
445	PuebloDam	PUEBLO DAM AND RESERVOIR	CO	11020002	110200	5	Missouri Basin	MB	330654	0101000020E61000003524EEB1F42D5AC0FE0E45813E214340
467	SeminoeDam	SEMINOE DAM AND RESERVOIR	WY	10180003	101800	5	Missouri Basin	MB	1017273	0101000020E610000092B3B0A71DBA5AC02BDEC83CF2134540
476	ShadehillDam	SHADEHILL DAM AND RESERVOIR	SD	10130302	101303	5	Missouri Basin	MB	120172	0101000020E6100000EC12D55B038D59C03F8C101E6DE04640
334	FolsomDam	FOLSOM DAM AND RESERVOIR	CA	18020111	180201	10	California - Great Basin	CGB	977000	0101000020E6100000E36BCF2C094A5EC0CA37DBDC985A4340
413	MillertonLake	MILLERTON LAKE - FRIANT DAM	CA	18040006	180400	10	California - Great Basin	CGB	520500	0101000020E61000007380608E1EED5DC0E52A16BF29804240
3204	NewMelonesLake	NEW MELONES LAKE - NEW MELONES DAM	CA	18040010	180400	10	California - Great Basin	CGB	2420000	0101000020E6100000D5E8D500A5215EC06EC0E78711FA4240
471	ShastaLake	SHASTA LAKE - SHASTA DAM	CA	18020005	180200	10	California - Great Basin	CGB	4552000	0101000020E6100000DB334B02D49A5EC0B24B546F0D5C4440
3203	TrinityLake	TRINITY LAKE - TRINITY DAM	CA	18010211	180102	10	California - Great Basin	CGB	2448000	0101000020E61000004DDBBFB2D2B05EC07DB1F7E28B664440
509	WhiskeytownLake	WHISKEYTOWN LAKE - WHISKEYTOWN DAM	CA	18020154	180201	10	California - Great Basin	CGB	237895	0101000020E61000003FE3C28190A25EC077F35487DC4C4440
3253	BoiseSystem	BOISE SYSTEM	ID	170501	170501	9	Columbia - Pacific Northwest	CPN	949700	0101000020E6100000895E46B1DCEE5CC0834C327216C64540
11	YakimaSystem	YAKIMA SYSTEM	WA	170300	170300	9	Columbia - Pacific Northwest	CPN	1065670	0101000020E6100000632827DA552E5EC0103B53E8BC6E4740
10	UpperSnakeSystem	SNAKE SYSTEM	ID	170402	170402	9	Columbia - Pacific Northwest	CPN	4045695	0101000020E6100000A79196CADB015CC05470784144AA4540
4	DeschutesSystem	DESCHUTES SYSTEM	ID	170703	170703	9	Columbia - Pacific Northwest	CPN	540687	0101000020E610000012A0A696AD4B5EC066F7E461A1164640
351	GranbyLake	LAKE GRANBY - GRANBY DAM	SD	14010001	140100	5	Missouri Basin	MB	539758	0101000020E61000005A9E077767775AC0B08F4E5DF9124440
353	GreenMountainDam	GREEN MOUNTAIN DAM AND RESERVOIR	SD	14010002	140100	5	Missouri Basin	MB	153639	0101000020E6100000C18BBE8234955AC02310AFEB17F04340
369	HorsetoothDam	HORSETOOTH DAM AND RESERVOIR	SD	10190007	101900	5	Missouri Basin	MB	156735	0101000020E61000003485CE6BEC4A5AC0DA571EA4A74C4440
288	CarterLakeDam	CARTER LAKE DAM AND RESERVOIR	SD	10190006	101900	5	Missouri Basin	MB	112230	0101000020E610000048A7AE7C964D5AC0A1DB4B1AA3294440
388	KeyholeDam	KEYHOLE DAM AND RESERVOIR	SD	10120201	101202	5	Missouri Basin	MB	188671	0101000020E610000087F9F202EC315AC0D40E7F4DD6304640
281	BoysenDam	BOYSEN DAM AND RESERVOIR	SD	10080005	100800	5	Missouri Basin	MB	741594	0101000020E61000006C09F9A0670B5BC05322895E46B54540
337	FresnoDam	FRESNO DAM AND RESERVOIR	SD	10050002	100500	5	Missouri Basin	MB	91746	0101000020E61000002A1DACFF737C5BC01ADEACC1FB4C4840
504	LakeWaconda	WACONDA LAKE - GLEN ELDER DAM	SD	10260015	102600	5	Missouri Basin	MB	219420	0101000020E61000008AE59656439458C042B0AA5E7EBF4340
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: geocode_settings; Type: TABLE DATA; Schema: tiger; Owner: -
--

COPY tiger.geocode_settings (name, setting, unit, category, short_desc) FROM stdin;
\.


--
-- Data for Name: pagc_gaz; Type: TABLE DATA; Schema: tiger; Owner: -
--

COPY tiger.pagc_gaz (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_lex; Type: TABLE DATA; Schema: tiger; Owner: -
--

COPY tiger.pagc_lex (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_rules; Type: TABLE DATA; Schema: tiger; Owner: -
--

COPY tiger.pagc_rules (id, rule, is_custom) FROM stdin;
\.


--
-- Data for Name: topology; Type: TABLE DATA; Schema: topology; Owner: -
--

COPY topology.topology (id, name, srid, "precision", hasz) FROM stdin;
\.


--
-- Data for Name: layer; Type: TABLE DATA; Schema: topology; Owner: -
--

COPY topology.layer (topology_id, layer_id, schema_name, table_name, feature_column, feature_type, level, child_id) FROM stdin;
\.


--
-- Name: resviz_ogc_fid_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.resviz_ogc_fid_seq', 1, false);


--
-- Name: resviz_parameters resviz_parameters_parameter_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resviz_parameters
    ADD CONSTRAINT resviz_parameters_parameter_id_key UNIQUE (parameter_id);


--
-- Name: resviz resviz_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resviz
    ADD CONSTRAINT resviz_pkey PRIMARY KEY (ogc_fid);


--
-- Name: resviz_stations resviz_stations_monitoring_location_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resviz_stations
    ADD CONSTRAINT resviz_stations_monitoring_location_id_key UNIQUE (monitoring_location_id);


--
-- Name: resviz unique_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resviz
    ADD CONSTRAINT unique_id UNIQUE (id);


--
-- Name: covjson_param_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX covjson_param_idx ON public.resviz USING btree (monitoring_location_id, parameter_id);


--
-- Name: covjson_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX covjson_time_idx ON public.resviz USING btree (data_date DESC) INCLUDE (value);


--
-- Name: resviz_geom_loc_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX resviz_geom_loc_idx ON public.resviz_stations USING gist (geom);


--
-- Name: resviz resviz_monitoring_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resviz
    ADD CONSTRAINT resviz_monitoring_location_id_fkey FOREIGN KEY (monitoring_location_id) REFERENCES public.resviz_stations(monitoring_location_id);


--
-- Name: resviz resviz_parameter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resviz
    ADD CONSTRAINT resviz_parameter_id_fkey FOREIGN KEY (parameter_id) REFERENCES public.resviz_parameters(parameter_id);


--
-- PostgreSQL database dump complete
--
