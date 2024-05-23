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
31	4	1923. adequate	{根本的な,すなわち,結果,十分な}	十分な	t	1805	十分な	[]
32	4	1909. mercy	{根本的な,自尊心,慈悲,...だが一方}	慈悲	t	1369	慈悲	[]
33	4	1919. verge	{究極の,軽蔑,瀬戸際,すなわち}	瀬戸際	t	1329	瀬戸際	[]
34	4	1905. intimate	{...に嫌悪を抱かせる,激怒した,苦しみ,親密な}	親密な	t	1786	親密な	[]
35	4	1908. self-esteem	{（感情が）心からの,自尊心,励み,抜本的な}	自尊心	t	1515	自尊心	[]
36	4	1928. drastic	{事実上,憂うつ,抜本的な,...に嫌悪を抱かせる}	抜本的な	t	1435	抜本的な	[]
37	4	1911. grief	{究極の,（人の死などに対する）深い悲しみ,苦しみ,憂うつ}	（人の死などに対する）深い悲しみ	t	1384	（人の死などに対する）深い悲しみ	[]
38	4	1903. despise	{親密な,根本的な,抜本的な,...を軽蔑する}	...を軽蔑する	t	4848	...を軽蔑する	[]
51	6	Nice talking to you.	{何かお手伝いしましょうか。いらっしゃいませ。,お話しできてよかったです。,～してはどうですか。,見ているだけです。}	お話しできてよかったです。	t	1670	お話しできてよかったです。	[]
52	6	How long does it take to do ~ ?	{ぜひそうしたいです。,ご自由にどうぞ。,～するのにどれくらいの時間がかかりますか。,気に入ってくれてうれしいです。}	～するのにどれくらいの時間がかかりますか。	t	1594	～するのにどれくらいの時間がかかりますか。	[]
53	6	I think so, too.	{まったくそんなことはありません。どういたしまして。,どうしましたか。何か問題がありますか。,私もそう思います。,（すぐに）そちらへ行きます。}	私もそう思います。	t	1573	私もそう思います。	[]
54	6	No problem.	{～はどうしたのですか。～のどこが悪いのですか。,～の時間です。,いいですよ。問題ありません。どういたしまして。,切らずにお待ちください。}	いいですよ。問題ありません。どういたしまして。	t	2149	いいですよ。問題ありません。どういたしまして。	[]
55	6	I'm not from here.	{私はここの者ではありません。不案内なもので。,ここへはよく来るのですか。,Aをお願いいたいのですが。,私も（～ではありません）。}	私はここの者ではありません。不案内なもので。	t	1753	私はここの者ではありません。不案内なもので。	[]
56	6	Thanks [Thank you] for doing ~ .	{～してくれてありがとう。,じゃあね。気を付けてね。,～をどうぞ。こちらが～になります。ここに～があります。,～をどう思いますか。}	～してくれてありがとう。	t	1164	～してくれてありがとう。	[]
57	6	Why not?	{そうだといいな。そう望みます。,どうして？もちろん。そうしよう。,～する時間です。,喜んで。}	どうして？もちろん。そうしよう。	t	1267	どうして？もちろん。そうしよう。	[]
58	6	Nice to see you (again) .	{～したいのですが。,(また)会えてうれしいです。,今行きます。,わかりません。}	(また)会えてうれしいです。	t	1319	(また)会えてうれしいです。	[]
59	6	Can I take a message?	{とにかくありがとう。,（それについて）考えておきます。,ご伝言を承りましょうか。,ええと。}	ご伝言を承りましょうか。	t	2145	ご伝言を承りましょうか。	[]
60	6	Just a moment [minute] .	{おめでとう！,残念ながら、違います[できません]。,まったくそんなことはありません。どういたしまして。,ちょっとお待ちください。}	ちょっとお待ちください。	t	2034	ちょっとお待ちください。	[]
61	7	stay off ~	{(方角・事情などが)逆に[で],ひっくり返る、倒れる、〜をひっくり返す,出発する、〜を引き起こす、〜を作動させる,(健康のため)〜を控える、〜に近づかない}	(健康のため)〜を控える、〜に近づかない	t	2942	(健康のため)〜を控える、〜に近づかない	[]
87	9	true	{具体的な,行う,"救う / 救出",真実の}	真実の	t	1501	真実の	[]
88	9	trust	{信頼する,回復する,"正しい / 訂正する","完全な / 完成させる"}	信頼する	t	983	信頼する	[]
89	9	long	{繰り返す,真実の,回復する,"長い / 長く / 切望する"}	長い / 長く / 切望する	t	1450	長い / 長く / 切望する	[]
90	9	surroundings	{"正しい / 訂正する",受け取る,環境,行う}	環境	t	1585	環境	[]
91	10	utmost	{最も,宿なしの,～しないように,間接の}	最も	t	970	最も	[]
92	10	ultraviolet	{間接の,紫外線の,最も,不意に}	紫外線の	t	1016	紫外線の	[]
93	10	indigenous	{先住の,不可欠な,不意に,興味深い}	先住の	t	1766	先住の	[]
94	10	intriguing	{興味深い,脊椎の,陽気な,不毛の}	興味深い	t	1131	興味深い	[]
95	10	mighty	{永続する,劇的に,強力な,主に}	強力な	t	1270	強力な	[]
96	10	hybrid	{劇的に,雑種の,強力な,～しないように}	雑種の	t	1782	雑種の	[]
97	10	merry	{主に,陽気な,逆に,最も}	陽気な	t	1770	陽気な	[]
98	10	daring	{不毛の,先住の,大胆な,紫外線の}	大胆な	t	1284	大胆な	[]
99	10	spinal	{宿なしの,脊椎の,永続する,最も}	脊椎の	t	1817	脊椎の	[]
39	4	1914. melancholy	{すなわち,ささいな,憂うつ,十分な}	憂うつ	t	1616	憂うつ	[]
40	4	1922. thorough	{良心,全体的な,完全な,事実上}	完全な	t	1948	完全な	[]
41	5	sturdy	{ほんのわずかの,統合する,細心の注意を払って、几帳面に,頑丈な、丈夫な}	頑丈な、丈夫な	t	2084	頑丈な、丈夫な	[]
42	5	unprecedented	{前例のない,分別を持って、思慮深く,加速度的に、指数関数的に,(ホテルや部屋などの)占有、占有人数}	前例のない	t	1187	前例のない	[]
43	5	turnover	{離職率,要約された、短縮された,使い果たす、激減させる,傷みやすい、腐りやすい}	離職率	t	1402	離職率	[]
44	5	itemize	{壁画,記念品、思い出の品,項目別にする,模範的な}	項目別にする	t	3113	項目別にする	[]
45	5	consolidate	{要約された、短縮された,急を要する、非常に重要な,参加者数、来場者数,統合する}	統合する	t	2250	統合する	[]
46	5	vigorous	{最高の、トップの,多才な,傷みやすい、腐りやすい,活気のある、精力的な}	活気のある、精力的な	t	1983	活気のある、精力的な	[]
47	5	imperative	{細心の注意を払って、几帳面に,その次の、その後の,急を要する、非常に重要な,(小切手やクーポンなどの)持参人}	急を要する、非常に重要な	t	3031	急を要する、非常に重要な	[]
48	5	objectionable	{提携した、関連のある,揺るがぬ、断固とした,不快な、気に障る,細心の注意を払って、几帳面に}	不快な、気に障る	t	2935	不快な、気に障る	[]
49	5	skeptical	{改正、修正,非常に厳しい,分別を持って、思慮深く,懐疑的な、疑い深い}	懐疑的な、疑い深い	t	1835	懐疑的な、疑い深い	[]
50	5	mandatory	{その次の、その後の,必要とする、〜を伴う,義務の、強制の,壁画}	義務の、強制の	t	1531	義務の、強制の	[]
62	7	stand up to ~	{(時間・金など)をとっておく、〜をわきへどける,〜をあくまでも擁護する、〜を支持する,(悪い事態を)黙って見ている、傍観する,〜に抵抗する、〜に立ち向かう、〜に耐える}	〜に抵抗する、〜に立ち向かう、〜に耐える	t	2747	〜に抵抗する、〜に立ち向かう、〜に耐える	[]
63	7	wash away ~	{〜を洗い流す、(記憶・感情など)を洗い去る,〜を抱き上げる、〜をすくい上げる,(時間・金など)をとっておく、〜をわきへどける,Aをつまずかせる、つまずく、しくじる}	〜を洗い流す、(記憶・感情など)を洗い去る	t	1251	〜を洗い流す、(記憶・感情など)を洗い去る	[]
64	7	work out ~	{〜を追跡して捕らえる、〜を追い詰める,〜を刷新する、〜を動揺させる、〜を奮い立たせる,(計画・対策など)を練る、(問題)を解決する、〜を計算する,Aを見下した調子で話す}	(計画・対策など)を練る、(問題)を解決する、〜を計算する	t	4188	(計画・対策など)を練る、(問題)を解決する、〜を計算する	[]
65	7	sit by	{(金額)を手付金として払う、〜を書き留める,(悪い事態を)黙って見ている、傍観する,(特に子供が)〜のことを告げ口する、〜にこたえる,〜を代表して意見を述べる、〜を代弁する、〜への支持を表明する}	(悪い事態を)黙って見ている、傍観する	t	2566	(悪い事態を)黙って見ている、傍観する	[]
66	7	take in ~	{〜を検討する、〜を手配する、〜を何とかする,嘔吐する、(食べ物)を吐く,〜を摂取する、(光景など)を観察する、〜をだます、〜を理解する,〜を提案[提出]する}	〜を摂取する、(光景など)を観察する、〜をだます、〜を理解する	t	1923	〜を摂取する、(光景など)を観察する、〜をだます、〜を理解する	[]
67	7	the other way around	{ざっと〜を読み上げる[に目を通す],(方角・事情などが)逆に[で],(商売・経済など)を好転させる、〜の向きを変える、好転する,〜を削除する、やっと(生計)を立てる}	(方角・事情などが)逆に[で]	t	3898	(方角・事情などが)逆に[で]	[]
68	7	sit back	{〜を洗い流す、(記憶・感情など)を洗い去る,(人・もの)を実際以上に興味深いもののように話す,(商売・経済など)を好転させる、〜の向きを変える、好転する,何もしないで[手をこまねいて]いる、くつろぐ、(いすに)深く座る}	何もしないで[手をこまねいて]いる、くつろぐ、(いすに)深く座る	t	3286	何もしないで[手をこまねいて]いる、くつろぐ、(いすに)深く座る	[]
69	7	set out to do ~	{〜に重くのしかかる、〜を圧迫する、〜を苦しめる,(力など)を発揮する、(計画・案など)を提出する,であることがわかる、集まる,〜することに着手する、〜し始める}	〜することに着手する、〜し始める	t	2545	〜することに着手する、〜し始める	[]
70	7	tear down ~	{〜を取り壊す、〜を解体する、〜を殴り倒す,〜に頼る、(犯罪・悪習など)に走る、〜に取りかかる,〜を抱き上げる、〜をすくい上げる,〜を追跡して捕らえる、〜を追い詰める}	〜を取り壊す、〜を解体する、〜を殴り倒す	t	1755	〜を取り壊す、〜を解体する、〜を殴り倒す	[]
71	8	on one's own	{旅行に行く,自身の力で、1人で,〜であると言われている,要求[請求]があり次第}	自身の力で、1人で	t	1191	自身の力で、1人で	[]
72	8	to one's surprise	{のどが痛む,驚いたことに,〜の意味を理解する,目立つ}	驚いたことに	t	1316	驚いたことに	[]
73	8	in spite of ~	{〜にもかかわらず,〜に追いつく,長い目で見れば、結局は,夜更かしをする}	〜にもかかわらず	t	1050	〜にもかかわらず	[]
74	8	catch up with ~	{Aを見送る,〜に追いつく,・・・する限り,〜に先立って、〜の前に}	〜に追いつく	t	1150	〜に追いつく	[]
75	8	stay in bed	{長い目で見れば、結局は,〜に飽きる,（外見などに反して）実際は,寝ている}	寝ている	t	3199	寝ている	[]
76	8	on board ~	{〜の結果として,〜に乗って,結論として、最後に,AかBどちらか}	〜に乗って	t	1982	〜に乗って	[]
77	8	dress up	{正装[盛装]する,努力する,〜に気づいている,〜を実行する}	正装[盛装]する	t	1116	正装[盛装]する	[]
78	8	from now on	{〜につながる、〜に通じる,もう〜分,今後ずっと,〜に成功する}	今後ずっと	t	1718	今後ずっと	[]
79	8	play an important role in ~	{まるで・・・のように,故障する,〜につながる、〜に通じる,〜で重要な役割を果たす}	〜で重要な役割を果たす	t	1848	〜で重要な役割を果たす	[]
80	8	to the point	{的を射た、適切に,用心する,〜を実行する,全力を尽くす}	的を射た、適切に	t	1069	的を射た、適切に	[]
81	9	complete	{"救う / 救出",真実の,"完全な / 完成させる",具体的な}	完全な / 完成させる	t	1235	完全な / 完成させる	[]
82	9	direct	{"出版する / 公表する","直接の / 向ける / 指導する",回復する,"長い / 長く / 切望する"}	直接の / 向ける / 指導する	t	1301	直接の / 向ける / 指導する	[]
83	9	perform	{快適な,行う,"救う / 救出",残念なことに}	行う	t	1347	行う	[]
84	9	spread	{"広がる / 広げる","遂行，実行 / 実績","救う / 救出","正しい / 訂正する"}	広がる / 広げる	t	870	広がる / 広げる	[]
85	9	equality	{平等,"出版する / 公表する",改善する,"完全な / 完成させる"}	平等	t	950	平等	[]
86	9	performance	{具体的な,"正しい / 訂正する","遂行，実行 / 実績","直接の / 向ける / 指導する"}	遂行，実行 / 実績	t	2463	遂行，実行 / 実績	[]
100	10	drastically	{紫外線の,強力な,不意に,劇的に}	劇的に	t	1548	劇的に	[]
101	11	1662. in contrast to [with]	{もしかしたら,〜の埋め合わせをする，〜を償う,出発する,〜とは対照的に}	〜とは対照的に	t	2151	〜とは対照的に	[]
102	11	1667. no more than	{その上，さらに,〜のために，〜が原因で,わずか〜，たった〜,いろいろな}	わずか〜，たった〜	t	1498	わずか〜，たった〜	[]
103	11	1657. at [from] a distance	{すなわち，より正確に言えば,結果として,〜の隣に,離れた所に［から］}	離れた所に［から］	t	1883	離れた所に［から］	[]
104	11	1680. by the way	{〜を引き継ぐ,言い換えると，つまり,ところで，それはそうと,いろいろな}	ところで，それはそうと	t	1514	ところで，それはそうと	[]
105	11	1619. indeed	{外国に［で］,幸運にも,確かに，本当に,〜を拒む，断る}	確かに，本当に	t	2667	確かに，本当に	[]
106	11	1700. in short	{要約すると，手短にいうと,〜に（遅れずに）ついて行く,〜を始める，設立する,意味をなす，理解しやすい}	要約すると，手短にいうと	t	1269	要約すると，手短にいうと	[]
107	11	1641. look to A (for B)	{Aに（Bを）期待する，当てにする,〜によれば,最も〜でない,...し始める，...しようと試みる}	Aに（Bを）期待する，当てにする	t	1467	Aに（Bを）期待する，当てにする	[]
108	11	1698. as a result	{できるだけ,結果として,徐々に，だんだんと,〜を処分する，取り除く}	結果として	t	1215	結果として	[]
109	11	1615. immediately	{直ちに,しかしながら,〜については，〜はどうかと言えば,...を確かめる}	直ちに	t	1234	直ちに	[]
110	11	1668. nothing but	{海外へ［に，で］,ただ〜だけ,その代わりに,たやすく，簡単に}	ただ〜だけ	t	2413	ただ〜だけ	[]
111	12	triumph	{救急車,勝利、歓喜,裸の、露出した,優秀さ、長所、価値}	勝利、歓喜	t	1236	勝利、歓喜	[]
112	12	council	{議会、評議会,微小な,飢えに苦しむ、渇望する,計り知れない、膨大な}	議会、評議会	t	1399	議会、評議会	[]
113	12	worship	{血行、流通、発行部数,崇拝、礼拝,を怒らせる、罪を犯す,に補償する、埋め合わせる}	崇拝、礼拝	t	1233	崇拝、礼拝	[]
114	12	suicide	{をかき回す、呼び起こす,変化のない、静止状態の,自殺,計り知れない、膨大な}	自殺	t	1184	自殺	[]
115	12	divorce	{用心、注意、警告,秘書、長官、大臣,離婚,頂上、首脳会談}	離婚	t	1366	離婚	[]
116	12	humid	{虫歯、衰退、荒廃、腐敗,湿気のある,を懇願する、請う,自慢する}	湿気のある	t	982	湿気のある	[]
117	12	assure	{を懇願する、請う,に安心させる、に保証する,を達成する、に到達する,陪審}	に安心させる、に保証する	t	1664	に安心させる、に保証する	[]
118	12	dare	{を侵略する、侵害する,嫉妬深い,あえて～する、～する勇気がある,祈る、懇願する}	あえて～する、～する勇気がある	t	1219	あえて～する、～する勇気がある	[]
119	12	vague	{をこぼす、こぼれる,原子,葬式,漠然とした}	漠然とした	t	1300	漠然とした	[]
120	12	glory	{栄光、全盛,と矛盾する、を否定する,情け、慈悲,祈る、懇願する}	栄光、全盛	t	1351	栄光、全盛	[]
121	13	1835. reconcile	{"[動] ～を一致させる ～を和解させる","[動] ～を抑圧、迫害する ～を悩ませる","[名] 治世 統治","[動] ～を割り当てる、分配する"}	[動] ～を一致させる ～を和解させる	t	1824	[動] ～を一致させる ～を和解させる	[]
122	13	1872. bribe	{"[名] 賄賂","[動] ～に暴行する ～を攻撃する","[形] しがちな 受けやすい、責任がある","[動] ～を抑圧、迫害する ～を悩ませる"}	[名] 賄賂	t	1631	[名] 賄賂	[]
123	13	1832. thrust	{"[動] ～を押し付ける ～を突き刺す、押し進む","[動] ～をひどく恐れる","[名] 感触、手触り 本質、質感","[動] 期限が切れる"}	[動] ～を押し付ける ～を突き刺す、押し進む	t	2414	[動] ～を押し付ける ～を突き刺す、押し進む	[]
124	13	1893. dumb	{"[形] 全体論の ホリスティックの","[名] 感触、手触り 本質、質感","[形] ばかげた 口のきけない、無言の","[動] ～を引き起こす ～を目覚めさせる"}	[形] ばかげた 口のきけない、無言の	t	1782	[形] ばかげた 口のきけない、無言の	[]
125	13	1888. notorious	{"[形] 悪名高い","[形] 青少年の","[名] 侵食 衰退","[名] 亡命 国外追放"}	[形] 悪名高い	t	965	[形] 悪名高い	[]
126	13	1831. forge	{"[動] ～を建てる ～を直立させる","[動] ～を偽造する ～を築く、～を鍛造する","[動] ～を編集する ～をまとめる","[名] 流域 盆地、海盆、洗面器"}	[動] ～を偽造する ～を築く、～を鍛造する	t	2336	[動] ～を偽造する ～を築く、～を鍛造する	[]
127	13	1847. plight	{"[動] ～を建てる ～を直立させる","[形] 湿気のある","[名] 窮状 悪い状態","[名] 下水"}	[名] 窮状 悪い状態	t	1627	[名] 窮状 悪い状態	[]
128	13	1829. flap	{"[形] めまいがする 当惑した","[名] 教義 政策上の主義","[名] 治世 統治","[動] パタパタ動く 羽ばたく、～をパタパタ動かす"}	[動] パタパタ動く 羽ばたく、～をパタパタ動かす	t	1714	[動] パタパタ動く 羽ばたく、～をパタパタ動かす	[]
129	13	1884. reckless	{"[動] ～に栄養を与える ～をはぐくむ","[形] 無謀な 顧みない","[名] 教義 政策上の主義","[動] ～を制止する ～を規制する"}	[形] 無謀な 顧みない	t	1384	[形] 無謀な 顧みない	[]
130	13	1813. mourn	{"[名] 弁護士 代理人","[動] 合併する ～を融合させる、溶け込む","[名] 窮状 悪い状態","[動] 悼む 嘆く"}	[動] 悼む 嘆く	t	1865	[動] 悼む 嘆く	[]
\.


--
-- Data for Name: QuizResult; Type: TABLE DATA; Schema: public; Owner: default
--

COPY public."QuizResult" (id, name, book, mode, start, "end", rank, "updatedAt") FROM stdin;
4	蒼唯先生	LEAP	EtoJ	1901	1935	SS	2024-05-22 17:25:41.771
5	蒼唯先生	kinhure	EtoJ	901	1000	SS	2024-05-22 17:27:31.398
6	蒼唯先生	passtan3	EtoJ	1201	1300	SS	2024-05-22 17:28:36.724
7	蒼唯先生	passtanP1	EtoJ	1801	1900	SS	2024-05-22 17:35:27.496
8	蒼唯先生	passtanP2	EtoJ	1401	1500	SS	2024-05-22 17:39:41.818
9	蒼唯先生	stock3000	EtoJ	1501	1528	SS	2024-05-22 17:40:55.211
10	蒼唯先生	systan	EtoJ	2001	2021	SS	2024-05-22 17:43:19.532
11	蒼唯先生	target1200	EtoJ	1601	1700	SS	2024-05-22 17:44:36.581
12	蒼唯先生	target1400	EtoJ	1301	1400	SS	2024-05-22 17:46:41.605
13	蒼唯先生	target1900	EtoJ	1801	1900	SS	2024-05-22 17:47:34.222
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

SELECT pg_catalog.setval('public."Contents_id_seq"', 130, true);


--
-- Name: QuizResult_id_seq; Type: SEQUENCE SET; Schema: public; Owner: default
--

SELECT pg_catalog.setval('public."QuizResult_id_seq"', 13, true);


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
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

