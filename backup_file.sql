--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.3

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: default
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO "default";

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: default
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Contents; Type: TABLE; Schema: public; Owner: default
--

CREATE TABLE public."Contents" (
    id integer NOT NULL,
    "quizResultId" integer NOT NULL,
    question text NOT NULL,
    choices text[],
    "selectedChoice" text NOT NULL,
    "isCorrect" boolean NOT NULL,
    "responseTime" integer NOT NULL,
    "correctAnswer" text NOT NULL,
    extra jsonb NOT NULL
);


ALTER TABLE public."Contents" OWNER TO "default";

--
-- Name: Contents_id_seq; Type: SEQUENCE; Schema: public; Owner: default
--

CREATE SEQUENCE public."Contents_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Contents_id_seq" OWNER TO "default";

--
-- Name: Contents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
--

ALTER SEQUENCE public."Contents_id_seq" OWNED BY public."Contents".id;


--
-- Name: QuizResult; Type: TABLE; Schema: public; Owner: default
--

CREATE TABLE public."QuizResult" (
    id integer NOT NULL,
    name text NOT NULL,
    book text NOT NULL,
    mode text NOT NULL,
    start integer NOT NULL,
    "end" integer NOT NULL,
    rank text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."QuizResult" OWNER TO "default";

--
-- Name: QuizResult_id_seq; Type: SEQUENCE; Schema: public; Owner: default
--

CREATE SEQUENCE public."QuizResult_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."QuizResult_id_seq" OWNER TO "default";

--
-- Name: QuizResult_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: default
--

ALTER SEQUENCE public."QuizResult_id_seq" OWNED BY public."QuizResult".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: default
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO "default";

--
-- Name: Contents id; Type: DEFAULT; Schema: public; Owner: default
--

ALTER TABLE ONLY public."Contents" ALTER COLUMN id SET DEFAULT nextval('public."Contents_id_seq"'::regclass);


--
-- Name: QuizResult id; Type: DEFAULT; Schema: public; Owner: default
--

ALTER TABLE ONLY public."QuizResult" ALTER COLUMN id SET DEFAULT nextval('public."QuizResult_id_seq"'::regclass);


--
-- Data for Name: Contents; Type: TABLE DATA; Schema: public; Owner: default
--

COPY public."Contents" (id, "quizResultId", question, choices, "selectedChoice", "isCorrect", "responseTime", "correctAnswer", extra) FROM stdin;
\.


--
-- Data for Name: QuizResult; Type: TABLE DATA; Schema: public; Owner: default
--

COPY public."QuizResult" (id, name, book, mode, start, "end", rank, "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: default
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
8ae54df6-0931-4e62-88c3-4819fcf0977e	4ffb6c3ba35fdb3248a5c333dfae987f4afcb5bd249b66cac807876181baea69	2024-05-22 14:53:11.365101+00	0_init		\N	2024-05-22 14:53:11.365101+00	0
\.


--
-- Name: Contents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: default
--

SELECT pg_catalog.setval('public."Contents_id_seq"', 20, true);


--
-- Name: QuizResult_id_seq; Type: SEQUENCE SET; Schema: public; Owner: default
--

SELECT pg_catalog.setval('public."QuizResult_id_seq"', 2, true);


--
-- Name: Contents Contents_pkey; Type: CONSTRAINT; Schema: public; Owner: default
--

ALTER TABLE ONLY public."Contents"
    ADD CONSTRAINT "Contents_pkey" PRIMARY KEY (id);


--
-- Name: QuizResult QuizResult_pkey; Type: CONSTRAINT; Schema: public; Owner: default
--

ALTER TABLE ONLY public."QuizResult"
    ADD CONSTRAINT "QuizResult_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: default
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Contents Contents_quizResultId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: default
--

ALTER TABLE ONLY public."Contents"
    ADD CONSTRAINT "Contents_quizResultId_fkey" FOREIGN KEY ("quizResultId") REFERENCES public."QuizResult"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: default
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

