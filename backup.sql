--
-- PostgreSQL database dump
--

\restrict 5A0irVemKmi5Mef0xaPIj8krtpqNsRnIMeavaedYqs3MJkB4NqfIgPrYvmyreTe

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg12+2)
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: rushigo_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO rushigo_user;

--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: deadlines; Type: TABLE; Schema: public; Owner: rushigo_user
--

CREATE TABLE public.deadlines (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description character varying(1000),
    course character varying(100),
    date timestamp with time zone NOT NULL,
    priority character varying(10) NOT NULL,
    estimated_hours integer,
    completed boolean NOT NULL,
    user_id integer NOT NULL,
    team_id integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.deadlines OWNER TO rushigo_user;

--
-- Name: deadlines_id_seq; Type: SEQUENCE; Schema: public; Owner: rushigo_user
--

CREATE SEQUENCE public.deadlines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.deadlines_id_seq OWNER TO rushigo_user;

--
-- Name: deadlines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rushigo_user
--

ALTER SEQUENCE public.deadlines_id_seq OWNED BY public.deadlines.id;


--
-- Name: memberships; Type: TABLE; Schema: public; Owner: rushigo_user
--

CREATE TABLE public.memberships (
    id integer NOT NULL,
    user_id integer,
    team_id integer,
    role character varying
);


ALTER TABLE public.memberships OWNER TO rushigo_user;

--
-- Name: memberships_id_seq; Type: SEQUENCE; Schema: public; Owner: rushigo_user
--

CREATE SEQUENCE public.memberships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.memberships_id_seq OWNER TO rushigo_user;

--
-- Name: memberships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rushigo_user
--

ALTER SEQUENCE public.memberships_id_seq OWNED BY public.memberships.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: rushigo_user
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    message character varying(1000),
    sent boolean,
    created_at timestamp without time zone
);


ALTER TABLE public.notifications OWNER TO rushigo_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: rushigo_user
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO rushigo_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rushigo_user
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: rushigo_user
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.teams OWNER TO rushigo_user;

--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: rushigo_user
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teams_id_seq OWNER TO rushigo_user;

--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rushigo_user
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: rushigo_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(100) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    is_active boolean,
    is_verified boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO rushigo_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: rushigo_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO rushigo_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rushigo_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: deadlines id; Type: DEFAULT; Schema: public; Owner: rushigo_user
--

ALTER TABLE ONLY public.deadlines ALTER COLUMN id SET DEFAULT nextval('public.deadlines_id_seq'::regclass);


--
-- Name: memberships id; Type: DEFAULT; Schema: public; Owner: rushigo_user
--

ALTER TABLE ONLY public.memberships ALTER COLUMN id SET DEFAULT nextval('public.memberships_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: rushigo_user
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: rushigo_user
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: rushigo_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: deadlines; Type: TABLE DATA; Schema: public; Owner: rushigo_user
--

COPY public.deadlines (id, title, description, course, date, priority, estimated_hours, completed, user_id, team_id, created_at, updated_at) FROM stdin;
34	UNIT 1 - Quiz 1	Quiz 1 for Unit 1.	Business Calculus	2026-01-08 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
35	Exam 1 - Questions Submission	Submission of questions for Exam 1.	Business Calculus	2026-01-09 19:20:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
36	Exam 1	Unit 1 Exam.	Business Calculus	2026-01-09 19:30:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
37	Average and Instantaneous Rate of Change Homework	Homework on Average and Instantaneous Rate of Change from Section 2.1 (Lipman et al).	Business Calculus	2026-01-09 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
38	Basic Differentiation Homework (Section 2.3)	Homework on Basic Differentiation from Section 2.3 (Lipman et al).	Business Calculus	2026-01-09 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
39	Finding Limits Algebraically Homework	Homework on Finding Limits Algebraically from OpenStax Calculus Book.	Business Calculus	2026-01-09 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
40	Finding Limits Graphically Homework	Homework on Finding Limits Graphically from Section 2.2 (Lippman et al).	Business Calculus	2026-01-09 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
41	Limit of The Difference Quotient Homework	Homework on Limit of The Difference Quotient from OpenStax Calculus Book.	Business Calculus	2026-01-09 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
42	Slope of The Tangent Line Using Limit Homework	Homework on finding the Slope of The Tangent Line Using Limit.	Business Calculus	2026-01-09 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
43	UNIT 1 Prerequisite Review	Review assignment for Unit 1 prerequisites from Section 2.4 (Lippman).	Business Calculus	2026-01-09 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
44	UNIT 1 - Quiz 2	Quiz 2 for Unit 1.	Business Calculus	2026-01-10 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
45	UNIT 2 - Quiz 1	Quiz 1 for Unit 2.	Business Calculus	2026-01-15 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
46	Basic Differentiation Homework (Section 2.5)	Homework on Basic Differentiation from Section 2.5 (Lipman et al).	Business Calculus	2026-01-16 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
47	Definite Integration Homework	Homework on Definite Integration from Section 3.1 (Lipman).	Business Calculus	2026-01-16 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
48	Derivatives and Marginal Analysis Homework	Homework on Derivatives and Marginal Analysis from Section 2.5 (Lipman et al).	Business Calculus	2026-01-16 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
49	Derivatives Product, Quotient and Chain Rules Homework	Homework on Product, Quotient, and Chain Rules for Derivatives from Section 2.5 (Lippman et al).	Business Calculus	2026-01-16 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
50	Elasticity of Demand Homework	Homework on Elasticity of Demand from Section 2.10 (Lippman et al).	Business Calculus	2026-01-16 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
51	Indefinite Integration Homework	Homework on Indefinite Integration from Section 3.3 (Lipman).	Business Calculus	2026-01-16 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
52	Tangent Lines Using Basic Differentiation Homework	Homework on finding Tangent Lines Using Basic Differentiation from Section 2.5 (Lipman et al).	Business Calculus	2026-01-16 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
53	UNIT 1 - Derivatives of e and ln x Homework	Homework on Derivatives of e and ln x from Section 2.5 (Lipman), part of Unit 1.	Business Calculus	2026-01-16 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
54	UNIT 2 - Quiz 2	Quiz 2 for Unit 2.	Business Calculus	2026-01-17 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
55	Project 2 Form C3	Submission for Project 2, Form C3. This project demonstrates technological competency and mathematical ability.	Business Calculus	2026-01-20 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
56	UNIT 3 - Quiz 1	Quiz 1 for Unit 3.	Business Calculus	2026-01-20 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
57	UNIT 3 - Quiz 2	Quiz 2 for Unit 3.	Business Calculus	2026-01-22 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
58	Area Between Curves Homework	Homework on Area Between Curves from Section 3.6 (Lipman).	Business Calculus	2026-01-23 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
59	Business Applications Homework	Homework on Business Applications from Section 3.7 (Lipman).	Business Calculus	2026-01-23 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
60	Calculus of Functions of Two Variables Homework	Homework on Calculus of Functions of Two Variables from Section 4.2.	Business Calculus	2026-01-23 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
61	Curve Sketching Using First and Second Derivative Homework	Homework on Curve Sketching Using First and Second Derivative.	Business Calculus	2026-01-23 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
62	Functions of Two Variables Homework	Homework on Functions of Two Variables from Section 4.1.	Business Calculus	2026-01-23 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
63	Fundamental Theorem Homework	Homework on the Fundamental Theorem (Section 3.3).	Business Calculus	2026-01-23 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
64	Optimization Homework (Section 2.7)	Homework on Optimization problems from Section 2.7.	Business Calculus	2026-01-23 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
65	Optimization with Two Variable Functions Homework	Homework on Optimization with Two Variable Functions from Section 4.3.	Business Calculus	2026-01-23 23:59:00+00	high	0	f	5	\N	2026-01-02 03:03:17.303976+00	\N
66	UNIT 1 - Quiz 1	Quiz 1 for Unit 1.	\N	2026-01-08 23:59:00+00	high	0	f	5	\N	2026-01-02 03:04:54.19098+00	\N
67	Exam 1 - Questions Submission	Submission of questions for Exam 1.	\N	2026-01-09 19:20:00+00	high	0	f	5	\N	2026-01-02 03:04:55.313702+00	\N
68	Exam 1	Unit 1 Exam.	\N	2026-01-09 19:30:00+00	high	0	f	5	\N	2026-01-02 03:04:55.517462+00	\N
69	Average and Instantaneous Rate of Change Homework	Homework on Average and Instantaneous Rate of Change from Section 2.1 (Lipman et al).	\N	2026-01-09 23:59:00+00	high	0	f	5	\N	2026-01-02 03:04:57.378417+00	\N
70	Basic Differentiation Homework (Section 2.3)	Homework on Basic Differentiation from Section 2.3 (Lipman et al).	\N	2026-01-09 23:59:00+00	high	0	f	5	\N	2026-01-02 03:04:59.634373+00	\N
71	Finding Limits Algebraically Homework	Homework on Finding Limits Algebraically from OpenStax Calculus Book.	\N	2026-01-09 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:00.207346+00	\N
72	Finding Limits Graphically Homework	Homework on Finding Limits Graphically from Section 2.2 (Lippman et al).	\N	2026-01-09 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:00.828964+00	\N
73	Limit of The Difference Quotient Homework	Homework on Limit of The Difference Quotient from OpenStax Calculus Book.	\N	2026-01-09 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:03.534223+00	\N
74	Slope of The Tangent Line Using Limit Homework	Homework on finding the Slope of The Tangent Line Using Limit.	\N	2026-01-09 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:04.185477+00	\N
75	UNIT 1 Prerequisite Review	Review assignment for Unit 1 prerequisites from Section 2.4 (Lippman).	\N	2026-01-09 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:04.748862+00	\N
76	UNIT 1 - Quiz 2	Quiz 2 for Unit 1.	\N	2026-01-10 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:07.369403+00	\N
77	UNIT 2 - Quiz 1	Quiz 1 for Unit 2.	\N	2026-01-15 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:08.003415+00	\N
78	Basic Differentiation Homework (Section 2.5)	Homework on Basic Differentiation from Section 2.5 (Lipman et al).	\N	2026-01-16 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:08.734015+00	\N
79	Definite Integration Homework	Homework on Definite Integration from Section 3.1 (Lipman).	\N	2026-01-16 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:09.344744+00	\N
80	Derivatives and Marginal Analysis Homework	Homework on Derivatives and Marginal Analysis from Section 2.5 (Lipman et al).	\N	2026-01-16 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:12.18067+00	\N
81	Derivatives Product, Quotient and Chain Rules Homework	Homework on Product, Quotient, and Chain Rules for Derivatives from Section 2.5 (Lippman et al).	\N	2026-01-16 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:12.934891+00	\N
82	Elasticity of Demand Homework	Homework on Elasticity of Demand from Section 2.10 (Lippman et al).	\N	2026-01-16 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:13.55156+00	\N
83	Indefinite Integration Homework	Homework on Indefinite Integration from Section 3.3 (Lipman).	\N	2026-01-16 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:15.916767+00	\N
84	Tangent Lines Using Basic Differentiation Homework	Homework on finding Tangent Lines Using Basic Differentiation from Section 2.5 (Lipman et al).	\N	2026-01-16 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:16.956889+00	\N
85	UNIT 1 - Derivatives of e and ln x Homework	Homework on Derivatives of e and ln x from Section 2.5 (Lipman), part of Unit 1.	\N	2026-01-16 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:17.634434+00	\N
86	UNIT 2 - Quiz 2	Quiz 2 for Unit 2.	\N	2026-01-17 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:19.723958+00	\N
87	Project 2 Form C3	Submission for Project 2, Form C3. This project demonstrates technological competency and mathematical ability.	\N	2026-01-20 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:20.608895+00	\N
88	UNIT 3 - Quiz 1	Quiz 1 for Unit 3.	\N	2026-01-20 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:21.235544+00	\N
89	UNIT 3 - Quiz 2	Quiz 2 for Unit 3.	\N	2026-01-22 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:22.250974+00	\N
90	Area Between Curves Homework	Homework on Area Between Curves from Section 3.6 (Lipman).	\N	2026-01-23 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:24.411667+00	\N
91	Business Applications Homework	Homework on Business Applications from Section 3.7 (Lipman).	\N	2026-01-23 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:25.000443+00	\N
92	Calculus of Functions of Two Variables Homework	Homework on Calculus of Functions of Two Variables from Section 4.2.	\N	2026-01-23 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:25.954444+00	\N
93	Curve Sketching Using First and Second Derivative Homework	Homework on Curve Sketching Using First and Second Derivative.	\N	2026-01-23 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:28.119481+00	\N
94	Functions of Two Variables Homework	Homework on Functions of Two Variables from Section 4.1.	\N	2026-01-23 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:29.113988+00	\N
95	Fundamental Theorem Homework	Homework on the Fundamental Theorem (Section 3.3).	\N	2026-01-23 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:30.176871+00	\N
96	Optimization Homework (Section 2.7)	Homework on Optimization problems from Section 2.7.	\N	2026-01-23 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:31.371853+00	\N
97	Optimization with Two Variable Functions Homework	Homework on Optimization with Two Variable Functions from Section 4.3.	\N	2026-01-23 23:59:00+00	high	0	f	5	\N	2026-01-02 03:05:32.209019+00	\N
98	Team 1 Class Presentation	Presentation by Team 1 on Strategy and Technology, Competitiveness, Resource Creation, the Value Chain, and Timing, covering Chapter 3 material.	BMGT301	2026-01-08 00:00:00+00	high	0	f	6	\N	2026-01-02 03:08:16.617145+00	\N
99	Excel Project 1 Submission	Submission of the first individual Excel assignment, focusing on Decision Making and the Use of IS. This contributes to the 'Excel Assignments' portion of the grade.	BMGT301	2026-01-10 23:59:00+00	high	0	f	6	\N	2026-01-02 03:08:16.617145+00	\N
100	Team 2 Class Presentation	Presentation by Team 2 on Netflix – Moving from Atoms to Bits, covering Chapter 5 material.	BMGT301	2026-01-13 00:00:00+00	high	0	f	6	\N	2026-01-02 03:08:16.617145+00	\N
101	Exam 1	First individual exam, in-class. Covers chapters 1, 2, 3, 4, and 5, plus App Excel Applications covered in class. Open notes, no Internet searches, no Excel use, and no devices are allowed.	BMGT301	2026-01-14 14:00:00+00	high	0	f	6	\N	2026-01-02 03:08:16.617145+00	\N
102	Team 3 Class Presentation	Presentation by Team 3 on Database Management, covering Chapter 17 material.	BMGT301	2026-01-15 00:00:00+00	high	0	f	6	\N	2026-01-02 03:08:16.617145+00	\N
103	Team 4 Class Presentation	Presentation by Team 4 on Network Effects, covering Chapter 10 material: Platforms, Network Effects and Competing in a Winner-Take-All World.	BMGT301	2026-01-16 00:00:00+00	high	0	f	6	\N	2026-01-02 03:08:16.617145+00	\N
104	Excel Project 2 Submission	Submission of the second individual Excel assignment. This contributes to the 'Excel Assignments' portion of the grade.	BMGT301	2026-01-17 23:59:00+00	high	0	f	6	\N	2026-01-02 03:08:16.617145+00	\N
105	Register with Disability Support Services (DSS)	Students with a disability requiring accommodation must provide documentation from Disability Support Services (DSS) to the instructor.	BMGT301	2026-01-19 23:59:00+00	medium	0	f	6	\N	2026-01-02 03:08:16.617145+00	\N
106	Notify Instructor of Religious Holiday Conflicts	Notify the instructor in writing of projected absences due to religious observance to make arrangements for make-up work or examinations.	BMGT301	2026-01-19 23:59:00+00	medium	0	f	6	\N	2026-01-02 03:08:16.617145+00	\N
107	Team 5 Class Presentation	Presentation by Team 5 on IT Infrastructure & Cloud Computing.	BMGT301	2026-01-20 00:00:00+00	high	0	f	6	\N	2026-01-02 03:08:16.617145+00	\N
108	Excel Project 3 Submission	Submission of the third individual Excel assignment. This contributes to the 'Excel Assignments' portion of the grade.	BMGT301	2026-01-21 23:59:00+00	high	0	f	6	\N	2026-01-02 03:08:16.617145+00	\N
109	Exam 2	Second individual exam. Covers Chapters 3, 10, 17 (plus data analytics), Hardware & Software and Cloud Computing, plus all Excel Applications and Tableau Applications. Open notes, no Internet searches, no Excel use, and no devices are allowed.	BMGT301	2026-01-23 00:00:00+00	high	0	f	6	\N	2026-01-02 03:08:16.617145+00	\N
110	Complete Excel Literacy Course Modules	Complete the 5 modules of the Excel Literacy Course.	BMGT301	2026-01-26 23:59:00+00	medium	0	f	6	\N	2026-01-02 03:08:16.617145+00	\N
111	Gmail working		\N	2026-01-04 19:23:00+00	high	0	f	1	\N	2026-01-04 00:23:55.79557+00	\N
114	Email sent?	\N	\N	2026-01-05 00:00:00+00	medium	0	f	1	1	2026-01-04 14:35:32.840543+00	2026-01-04 14:35:33.011402+00
117	yohohohoh		\N	2026-01-04 17:40:00+00	medium	0	f	7	\N	2026-01-04 16:37:10.066209+00	\N
118	Academic Integrity Tutorial & Quiz	Complete the Academic Integrity Tutorial and related quiz available on Blackboard. This is a mandatory foundational task for the course.	Health Communication (PBHL 340)	2026-02-08 23:59:00+00	medium	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
119	Participation #1: Take-away Assignment	Complete the take-away assignment, addressing three key points from the Week 1 recording. This is due after the first class on Wednesday.	Health Communication (PBHL 340)	2026-01-28 23:59:00+00	medium	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
120	Participation #2: Take-away Assignment	Complete the take-away assignment, addressing three key points from the Week 2 recording, in advance of attending class.	Health Communication (PBHL 340)	2026-02-04 19:09:00+00	medium	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
121	Project Topic Submission	Submit your chosen topic for the Health Communications Campaign Group Project.	Health Communication (PBHL 340)	2026-02-11 23:59:00+00	high	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
122	Participation #3: Take-away Assignment	Complete the take-away assignment, addressing three key points from the Week 3 recording, in advance of attending class.	Health Communication (PBHL 340)	2026-02-11 19:09:00+00	medium	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
123	Participation #4: Take-away Assignment	Complete the take-away assignment, addressing three key points from the Week 4 recording, in advance of attending class.	Health Communication (PBHL 340)	2026-02-18 19:09:00+00	medium	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
124	Exam 1	First course exam, covering concepts from the initial modules. The exam opens on Thursday of Week 5 and closes on Sunday at midnight.	Health Communication (PBHL 340)	2026-03-01 23:59:00+00	high	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
125	Participation #5: Take-away Assignment	Complete the take-away assignment, addressing three key points from the Week 6 recording, in advance of attending class.	Health Communication (PBHL 340)	2026-03-04 19:09:00+00	medium	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
126	Formative Research/Literature Review	Submit the formative research and literature review component for the Health Communications Campaign Group Project.	Health Communication (PBHL 340)	2026-03-11 23:59:00+00	high	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
127	Participation #6: Take-away Assignment	Complete the take-away assignment, addressing three key points from the Week 7 recording, in advance of attending class.	Health Communication (PBHL 340)	2026-03-11 19:09:00+00	medium	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
128	Participation #7: Take-away Assignment	Complete the take-away assignment, addressing three key points from the Week 9 recording, in advance of attending class.	Health Communication (PBHL 340)	2026-03-25 19:09:00+00	medium	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
129	Participation #8: Take-away Assignment	Complete the take-away assignment, addressing three key points from the Week 10 recording, in advance of attending class.	Health Communication (PBHL 340)	2026-04-01 19:09:00+00	medium	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
130	Message Testing Assignment	Submit the message testing component for the Health Communications Campaign Group Project.	Health Communication (PBHL 340)	2026-04-08 23:59:00+00	high	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
131	Participation #9: Take-away Assignment	Complete the take-away assignment, addressing three key points from the Week 12 recording, in advance of attending class.	Health Communication (PBHL 340)	2026-04-15 19:09:00+00	medium	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
132	Participation #10: Take-away Assignment	Complete the take-away assignment, addressing three key points from the Week 13 recording, in advance of attending class.	Health Communication (PBHL 340)	2026-04-22 19:09:00+00	medium	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
133	Written Health Communication Plan & Draft Product	Submit the written health communication plan and draft product for the Health Communications Campaign Group Project.	Health Communication (PBHL 340)	2026-04-29 23:59:00+00	high	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
134	Group Project In-person Presentation	Deliver the in-person presentation for the Health Communications Campaign Group Project during class.	Health Communication (PBHL 340)	2026-04-29 19:10:00+00	high	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
135	Peer Reviews of Presentations	Submit peer reviews for the group presentations. This is the only individually graded portion of the course.	Health Communication (PBHL 340)	2026-05-06 23:59:00+00	high	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
136	Exam 2	Second course exam, covering concepts from the later modules. The exam opens on Friday in the morning of Week 16 and closes on Sunday at midnight.	Health Communication (PBHL 340)	2026-05-17 23:59:00+00	high	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
137	Extra Credit: Seminar/Event Reflection	Attend a relevant seminar or event and submit a brief summary explaining its relation to a course concept for extra credit. Reflections are due within two weeks of the event.	Health Communication (PBHL 340)	2026-05-17 23:59:00+00	low	0	f	3	\N	2026-01-05 16:47:32.316355+00	\N
138	Complete Academic Integrity Tutorial and Quiz	Students are required to take the Academic Integrity Tutorial and the related quiz available under course materials on Blackboard. This is a foundational requirement for all students.	Research Methods in Health (PBHL 300)	2026-01-30 23:59:00+00	medium	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
139	Participation #1: Take-Away Assignment	Submit a prompt addressing three take-aways from the online recording for Week 1. This submission is due after the Wednesday class.	Research Methods in Health (PBHL 300)	2026-01-28 23:59:00+00	medium	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
140	Participation #2: Take-Away Assignment	Submit a prompt addressing three take-aways from the online recording for Week 2. This assignment is due in advance of the Wednesday class.	Research Methods in Health (PBHL 300)	2026-02-04 15:59:00+00	medium	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
141	Complete CITI Training Certificate	Complete the UMBC CITI training and submit the certificate. This is a mandatory requirement within three weeks of joining the course.	Research Methods in Health (PBHL 300)	2026-02-11 15:59:00+00	high	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
142	Participation #3: Take-Away Assignment	Submit a prompt addressing three take-aways from the online recording for Week 3. This assignment is due in advance of the Wednesday class.	Research Methods in Health (PBHL 300)	2026-02-11 15:59:00+00	medium	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
143	Research Project: Group Topics Submission	Submit the chosen group topic for the research project (5% of research project grade).	Research Methods in Health (PBHL 300)	2026-02-18 15:59:00+00	high	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
144	Participation #4: Take-Away Assignment	Submit a prompt addressing three take-aways from the online recording for Week 4. This assignment is due in advance of the Wednesday class.	Research Methods in Health (PBHL 300)	2026-02-18 15:59:00+00	medium	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
145	Participation #5: Take-Away Assignment	Submit a prompt addressing three take-aways from the online recording for Week 5. This assignment is due in advance of the Wednesday class.	Research Methods in Health (PBHL 300)	2026-02-25 15:59:00+00	medium	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
146	Participation #6: Take-Away Assignment	Submit a prompt addressing three take-aways from the online recording for Week 6. This assignment is due in advance of the Wednesday class.	Research Methods in Health (PBHL 300)	2026-03-04 15:59:00+00	medium	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
147	Research Project: Project Outline Submission	Submit the outline for the group research project (5% of research project grade).	Research Methods in Health (PBHL 300)	2026-03-11 15:59:00+00	high	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
148	Participation #7: Take-Away Assignment	Submit a prompt addressing three take-aways from the online recording for Week 7. This assignment is due in advance of the Wednesday class.	Research Methods in Health (PBHL 300)	2026-03-11 15:59:00+00	medium	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
149	Exam 1	The first exam for the course, covering concepts learned in prior modules. The exam opens on Thursday and closes Sunday at midnight of Week 9.	Research Methods in Health (PBHL 300)	2026-03-29 23:59:00+00	high	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
150	Participation #8: Take-Away Assignment	Submit a prompt addressing three take-aways from the online recording for Week 10. This assignment is due in advance of the Wednesday class.	Research Methods in Health (PBHL 300)	2026-04-01 15:59:00+00	medium	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
151	Participation #9: Take-Away Assignment	Submit a prompt addressing three take-aways from the online recording for Week 12. This assignment is due in advance of the Wednesday class.	Research Methods in Health (PBHL 300)	2026-04-15 15:59:00+00	medium	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
152	Ethics Case Study	Complete an ethics review of a public health research study (5% of final grade).	Research Methods in Health (PBHL 300)	2026-04-22 15:59:00+00	high	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
153	Participation #10: Take-Away Assignment	Submit a prompt addressing three take-aways from the online recording for Week 13. This assignment is due in advance of the Wednesday class.	Research Methods in Health (PBHL 300)	2026-04-22 15:59:00+00	medium	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
154	Research Project: Written Proposal Submission	Submit the written research proposal for the group project (10% of research project grade).	Research Methods in Health (PBHL 300)	2026-04-29 15:59:00+00	high	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
155	Research Project: 'Blitz' Presentation Submission	Submit materials for the group research project 'Blitz' presentation (15% of research project grade), which will be presented in class during Week 14.	Research Methods in Health (PBHL 300)	2026-04-29 15:59:00+00	high	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
156	Research Project: Peer-Review	Complete and submit peer-reviews for the research project presentations (10% of research project grade).	Research Methods in Health (PBHL 300)	2026-05-06 15:59:00+00	high	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
157	Exam 2	The second exam for the course, covering concepts learned in later modules. The exam opens on Friday, May 15th, in the morning and closes Sunday, May 17th, at midnight.	Research Methods in Health (PBHL 300)	2026-05-17 23:59:00+00	high	0	f	3	\N	2026-01-05 16:48:56.309799+00	\N
\.


--
-- Data for Name: memberships; Type: TABLE DATA; Schema: public; Owner: rushigo_user
--

COPY public.memberships (id, user_id, team_id, role) FROM stdin;
1	1	1	admin
2	2	1	member
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: rushigo_user
--

COPY public.notifications (id, user_id, message, sent, created_at) FROM stdin;
1	1	Approaching deadline notification sent for: Gmail working (same_day)	t	2026-01-04 15:10:48.658496
2	1	Approaching deadline notification sent for: Email sent? (same_day)	t	2026-01-04 15:10:48.818901
3	1	Approaching deadline notification sent for: One hour (1_hour)	t	2026-01-04 15:10:49.022163
4	1	Overdue deadline notification sent for: LinkedIn post	t	2026-01-04 15:10:49.186014
5	1	Overdue deadline notification sent for: deadline	t	2026-01-04 15:10:49.466307
6	1	Overdue deadline notification sent for: Does it work?	t	2026-01-04 15:10:49.744381
7	1	Overdue deadline notification sent for: One hour	t	2026-01-04 15:45:27.592815
8	7	Overdue deadline notification sent for: Yohohoho	t	2026-01-04 16:35:43.811517
9	7	Approaching deadline notification sent for: yohohohoh (1_hour)	t	2026-01-04 16:40:44.319115
10	1	Overdue deadline notification sent for: LinkedIn post	t	2026-01-05 04:45:25.440909
11	1	Overdue deadline notification sent for: Gmail working	t	2026-01-05 04:45:25.594916
12	1	Overdue deadline notification sent for: deadline	t	2026-01-05 04:45:25.744026
13	1	Overdue deadline notification sent for: Does it work?	t	2026-01-05 04:45:25.951042
14	1	Overdue deadline notification sent for: Email sent?	t	2026-01-05 04:45:26.154096
15	1	Overdue deadline notification sent for: One hour	t	2026-01-05 04:45:26.382447
16	7	Overdue deadline notification sent for: yohohohoh	t	2026-01-05 04:45:26.657707
17	5	Approaching deadline notification sent for: UNIT 1 - Quiz 1 (3_days)	t	2026-01-06 00:05:12.63502
18	5	Approaching deadline notification sent for: UNIT 1 - Quiz 1 (3_days)	t	2026-01-06 00:05:12.792679
19	1	Overdue deadline notification sent for: Gmail working	t	2026-01-06 00:05:12.959493
20	1	Overdue deadline notification sent for: Email sent?	t	2026-01-06 00:05:13.184961
21	7	Overdue deadline notification sent for: yohohohoh	t	2026-01-06 00:05:13.516945
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: rushigo_user
--

COPY public.teams (id, name, description, created_at) FROM stdin;
1	Rushigo	\N	2025-12-30 21:14:15.478307+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: rushigo_user
--

COPY public.users (id, email, username, hashed_password, is_active, is_verified, created_at, updated_at) FROM stdin;
1	ttpvt01@gmail.com	tejassst	$pbkdf2-sha256$29000$ijFGyBljbI2RMgaA8F4LgQ$b1UQihwZSZDRBkW3tJzF6OpYuWDRLkhL35eUkz0DIwc	t	f	2025-12-30 20:17:48.533961+00	\N
2	suhaanithakur33@gmail.com	sthakur3	$pbkdf2-sha256$29000$27uXUooRIsT433tv7X1PaQ$yppk7ofU1zIcJDBkfRwlZMw8D93K.yzWNHFuIXn5j5Y	t	f	2025-12-30 20:28:15.174781+00	\N
3	aasthakp602@gmail.com	aasthapatel	$pbkdf2-sha256$29000$DCHEeO89Z2zNube2Vmrt3Q$S1oKgOkTVG4d892LXFBKYMAxGCs8l8wvatZ5aWdGV9k	t	f	2025-12-30 21:35:27.946284+00	\N
4	dishatyagi12102006@gmail.com	cherry	$pbkdf2-sha256$29000$sDbmfK91jtF6L2UModS6Fw$3BcH6wKzpM5X8IIbU5AJxWDB.ewCYWBNFBlPelRGDIc	t	f	2025-12-31 02:29:54.538618+00	\N
5	dbp0777@gmail.com	dharrrrmmm	$pbkdf2-sha256$29000$cc45pzRmbE1prRUiROjdWw$tk1LAtKoowvR46CpiiHWAs86.daJsz8GT4uq61tGa4Q	t	f	2026-01-02 03:02:09.603915+00	\N
6	raj.rao1307@gmail.com	rajveeer1	$pbkdf2-sha256$29000$VwrhvDdGSKnVOkfo3ZsTIg$AvmLfUIsfx.2773vUFS.myU2pXccakyeyhJimasmxw4	t	f	2026-01-02 03:07:11.579344+00	\N
7	tejast01052005@gmail.com	tejast1	$pbkdf2-sha256$29000$HuPcm7PWOmeMce59DyGEEA$p1r/wEgr/8KfqamcXLxlik82AxvhRdHe8LgEgm.s5OE	t	f	2026-01-04 15:45:27.938158+00	\N
\.


--
-- Name: deadlines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rushigo_user
--

SELECT pg_catalog.setval('public.deadlines_id_seq', 157, true);


--
-- Name: memberships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rushigo_user
--

SELECT pg_catalog.setval('public.memberships_id_seq', 2, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rushigo_user
--

SELECT pg_catalog.setval('public.notifications_id_seq', 21, true);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rushigo_user
--

SELECT pg_catalog.setval('public.teams_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rushigo_user
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: deadlines deadlines_pkey; Type: CONSTRAINT; Schema: public; Owner: rushigo_user
--

ALTER TABLE ONLY public.deadlines
    ADD CONSTRAINT deadlines_pkey PRIMARY KEY (id);


--
-- Name: memberships memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: rushigo_user
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: rushigo_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: rushigo_user
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: rushigo_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_deadlines_course; Type: INDEX; Schema: public; Owner: rushigo_user
--

CREATE INDEX ix_deadlines_course ON public.deadlines USING btree (course);


--
-- Name: ix_deadlines_id; Type: INDEX; Schema: public; Owner: rushigo_user
--

CREATE INDEX ix_deadlines_id ON public.deadlines USING btree (id);


--
-- Name: ix_deadlines_priority; Type: INDEX; Schema: public; Owner: rushigo_user
--

CREATE INDEX ix_deadlines_priority ON public.deadlines USING btree (priority);


--
-- Name: ix_deadlines_title; Type: INDEX; Schema: public; Owner: rushigo_user
--

CREATE INDEX ix_deadlines_title ON public.deadlines USING btree (title);


--
-- Name: ix_memberships_id; Type: INDEX; Schema: public; Owner: rushigo_user
--

CREATE INDEX ix_memberships_id ON public.memberships USING btree (id);


--
-- Name: ix_notifications_id; Type: INDEX; Schema: public; Owner: rushigo_user
--

CREATE INDEX ix_notifications_id ON public.notifications USING btree (id);


--
-- Name: ix_teams_id; Type: INDEX; Schema: public; Owner: rushigo_user
--

CREATE INDEX ix_teams_id ON public.teams USING btree (id);


--
-- Name: ix_teams_name; Type: INDEX; Schema: public; Owner: rushigo_user
--

CREATE INDEX ix_teams_name ON public.teams USING btree (name);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: rushigo_user
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: rushigo_user
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: ix_users_username; Type: INDEX; Schema: public; Owner: rushigo_user
--

CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);


--
-- Name: deadlines deadlines_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rushigo_user
--

ALTER TABLE ONLY public.deadlines
    ADD CONSTRAINT deadlines_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: deadlines deadlines_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rushigo_user
--

ALTER TABLE ONLY public.deadlines
    ADD CONSTRAINT deadlines_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: memberships memberships_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rushigo_user
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: memberships memberships_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rushigo_user
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rushigo_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT wal_buffers_full bigint, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT parallel_workers_to_launch bigint, OUT parallel_workers_launched bigint, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT wal_buffers_full bigint, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT parallel_workers_to_launch bigint, OUT parallel_workers_launched bigint, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO rushigo_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO rushigo_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO rushigo_user;


--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO rushigo_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO rushigo_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO rushigo_user;


--
-- PostgreSQL database dump complete
--

\unrestrict 5A0irVemKmi5Mef0xaPIj8krtpqNsRnIMeavaedYqs3MJkB4NqfIgPrYvmyreTe

