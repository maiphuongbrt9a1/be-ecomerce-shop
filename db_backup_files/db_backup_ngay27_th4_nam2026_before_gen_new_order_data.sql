--
-- PostgreSQL database dump
--

-- Dumped from database version 17.9 (Debian 17.9-1.pgdg13+1)
-- Dumped by pg_dump version 17.2

-- Started on 2026-04-27 16:45:11

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
-- TOC entry 5 (class 2615 OID 17727)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 3913 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 1017 (class 1247 OID 21104)
-- Name: AnalyticsViewMode; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AnalyticsViewMode" AS ENUM (
    'WEEKLY',
    'MONTHLY',
    'YEARLY'
);


ALTER TYPE public."AnalyticsViewMode" OWNER TO postgres;

--
-- TOC entry 897 (class 1247 OID 17729)
-- Name: DiscountType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DiscountType" AS ENUM (
    'PERCENTAGE',
    'FIXED_AMOUNT'
);


ALTER TYPE public."DiscountType" OWNER TO postgres;

--
-- TOC entry 900 (class 1247 OID 17734)
-- Name: Gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER'
);


ALTER TYPE public."Gender" OWNER TO postgres;

--
-- TOC entry 903 (class 1247 OID 17742)
-- Name: MediaType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MediaType" AS ENUM (
    'IMAGE',
    'VIDEO',
    'DOCUMENT'
);


ALTER TYPE public."MediaType" OWNER TO postgres;

--
-- TOC entry 906 (class 1247 OID 17750)
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'SHOP_NOTIFICATION',
    'PERSONAL_NOTIFICATION'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- TOC entry 909 (class 1247 OID 17756)
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PAYMENT_PROCESSING',
    'PAYMENT_CONFIRMED',
    'WAITING_FOR_PICKUP',
    'SHIPPED',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
    'RETURNED',
    'DELIVERED_FAILED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- TOC entry 912 (class 1247 OID 17778)
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'COD',
    'VNPAY'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- TOC entry 915 (class 1247 OID 17784)
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED',
    'CANCELLED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- TOC entry 918 (class 1247 OID 17796)
-- Name: RequestStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RequestStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."RequestStatus" OWNER TO postgres;

--
-- TOC entry 921 (class 1247 OID 17806)
-- Name: RequestType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RequestType" AS ENUM (
    'RETURN_REQUEST',
    'CANCEL_REQUEST',
    'CUSTOMER_SUPPORT'
);


ALTER TYPE public."RequestType" OWNER TO postgres;

--
-- TOC entry 924 (class 1247 OID 17814)
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN',
    'OPERATOR'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- TOC entry 927 (class 1247 OID 17822)
-- Name: ShipmentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ShipmentStatus" AS ENUM (
    'PENDING',
    'WAITING_FOR_PICKUP',
    'SHIPPED',
    'DELIVERED',
    'DELIVERED_FAILED',
    'RETURNED',
    'CANCELLED'
);


ALTER TYPE public."ShipmentStatus" OWNER TO postgres;

--
-- TOC entry 930 (class 1247 OID 17838)
-- Name: VietnamBankName; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VietnamBankName" AS ENUM (
    'AGRIBANK',
    'BIDV',
    'VIETCOMBANK',
    'VIETINBANK',
    'MBBANK',
    'ACB',
    'TECHCOMBANK',
    'VPBANK',
    'TPBANK',
    'SACOMBANK',
    'HDBANK',
    'VIB',
    'OCB',
    'SHB',
    'SEABANK',
    'EXIMBANK',
    'MSB',
    'NAMABANK',
    'BACABANK',
    'PVCOMBANK',
    'ABBANK',
    'LIENVIETPOSTBANK',
    'KIENLONGBANK',
    'VIETABANK',
    'SAIGONBANK'
);


ALTER TYPE public."VietnamBankName" OWNER TO postgres;

--
-- TOC entry 933 (class 1247 OID 17890)
-- Name: VoucherStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VoucherStatus" AS ENUM (
    'AVAILABLE',
    'SAVED',
    'USED',
    'EXPIRED'
);


ALTER TYPE public."VoucherStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 17899)
-- Name: Address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Address" (
    id bigint NOT NULL,
    "userId" bigint,
    street character varying(255) NOT NULL,
    ward character varying(100) NOT NULL,
    district character varying(100) NOT NULL,
    province character varying(100) NOT NULL,
    "zipCode" character varying(20) NOT NULL,
    country character varying(100) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isOrderAddress" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Address" OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 17906)
-- Name: Address_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Address_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Address_id_seq" OWNER TO postgres;

--
-- TOC entry 3915 (class 0 OID 0)
-- Dependencies: 218
-- Name: Address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Address_id_seq" OWNED BY public."Address".id;


--
-- TOC entry 219 (class 1259 OID 17907)
-- Name: Cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Cart" (
    id bigint NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" bigint NOT NULL
);


ALTER TABLE public."Cart" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 17911)
-- Name: CartItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CartItems" (
    id bigint NOT NULL,
    "cartId" bigint NOT NULL,
    "productVariantId" bigint NOT NULL,
    quantity integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CartItems" OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17915)
-- Name: CartItems_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CartItems_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CartItems_id_seq" OWNER TO postgres;

--
-- TOC entry 3916 (class 0 OID 0)
-- Dependencies: 221
-- Name: CartItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CartItems_id_seq" OWNED BY public."CartItems".id;


--
-- TOC entry 222 (class 1259 OID 17916)
-- Name: Cart_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Cart_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Cart_id_seq" OWNER TO postgres;

--
-- TOC entry 3917 (class 0 OID 0)
-- Dependencies: 222
-- Name: Cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Cart_id_seq" OWNED BY public."Cart".id;


--
-- TOC entry 223 (class 1259 OID 17917)
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    "parentId" bigint,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createByUserId" bigint NOT NULL,
    "voucherId" bigint
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 17923)
-- Name: Category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Category_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Category_id_seq" OWNER TO postgres;

--
-- TOC entry 3918 (class 0 OID 0)
-- Dependencies: 224
-- Name: Category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;


--
-- TOC entry 225 (class 1259 OID 17924)
-- Name: Color; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Color" (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    "hexCode" character varying(7) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Color" OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17928)
-- Name: Color_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Color_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Color_id_seq" OWNER TO postgres;

--
-- TOC entry 3919 (class 0 OID 0)
-- Dependencies: 226
-- Name: Color_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Color_id_seq" OWNED BY public."Color".id;


--
-- TOC entry 227 (class 1259 OID 17929)
-- Name: GhnPickShift; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GhnPickShift" (
    id bigint NOT NULL,
    "ghnShiftId" bigint NOT NULL,
    "ghnTitle" character varying(255) NOT NULL,
    "ghnFromTime" bigint NOT NULL,
    "ghnToTime" bigint NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."GhnPickShift" OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17933)
-- Name: GhnPickShift_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."GhnPickShift_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."GhnPickShift_id_seq" OWNER TO postgres;

--
-- TOC entry 3920 (class 0 OID 0)
-- Dependencies: 228
-- Name: GhnPickShift_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."GhnPickShift_id_seq" OWNED BY public."GhnPickShift".id;


--
-- TOC entry 229 (class 1259 OID 17934)
-- Name: Media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Media" (
    id bigint NOT NULL,
    url text NOT NULL,
    "reviewId" bigint,
    "userId" bigint,
    "productVariantId" bigint,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    type public."MediaType" DEFAULT 'IMAGE'::public."MediaType" NOT NULL,
    "isShopBanner" boolean DEFAULT false NOT NULL,
    "isShopLogo" boolean DEFAULT false NOT NULL,
    "isCategoryFile" boolean DEFAULT false NOT NULL,
    "isAvatarFile" boolean DEFAULT false NOT NULL,
    "requestId" bigint,
    "productId" bigint
);


ALTER TABLE public."Media" OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17945)
-- Name: Media_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Media_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Media_id_seq" OWNER TO postgres;

--
-- TOC entry 3921 (class 0 OID 0)
-- Dependencies: 230
-- Name: Media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Media_id_seq" OWNED BY public."Media".id;


--
-- TOC entry 231 (class 1259 OID 17946)
-- Name: Message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Message" (
    id bigint NOT NULL,
    content text NOT NULL,
    "senderId" bigint NOT NULL,
    "roomChatId" bigint NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Message" OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 17952)
-- Name: Message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Message_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Message_id_seq" OWNER TO postgres;

--
-- TOC entry 3922 (class 0 OID 0)
-- Dependencies: 232
-- Name: Message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Message_id_seq" OWNED BY public."Message".id;


--
-- TOC entry 233 (class 1259 OID 17953)
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id bigint NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    type public."NotificationType" DEFAULT 'SHOP_NOTIFICATION'::public."NotificationType" NOT NULL,
    "creatorId" bigint,
    "recipientId" bigint,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 17961)
-- Name: Notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Notification_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Notification_id_seq" OWNER TO postgres;

--
-- TOC entry 3923 (class 0 OID 0)
-- Dependencies: 234
-- Name: Notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Notification_id_seq" OWNED BY public."Notification".id;


--
-- TOC entry 235 (class 1259 OID 17962)
-- Name: OrderItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItems" (
    id bigint NOT NULL,
    "orderId" bigint NOT NULL,
    "productVariantId" bigint NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" double precision NOT NULL,
    "totalPrice" double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "discountValue" double precision DEFAULT 0 NOT NULL,
    "currencyUnit" character varying(10) DEFAULT 'VND'::character varying NOT NULL,
    "appliedVoucherId" bigint
);


ALTER TABLE public."OrderItems" OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 17968)
-- Name: OrderItems_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."OrderItems_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."OrderItems_id_seq" OWNER TO postgres;

--
-- TOC entry 3924 (class 0 OID 0)
-- Dependencies: 236
-- Name: OrderItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."OrderItems_id_seq" OWNED BY public."OrderItems".id;


--
-- TOC entry 237 (class 1259 OID 17969)
-- Name: Orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Orders" (
    id bigint NOT NULL,
    "shippingAddressId" bigint NOT NULL,
    "orderDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "subTotal" double precision NOT NULL,
    "shippingFee" double precision NOT NULL,
    discount double precision NOT NULL,
    "totalAmount" double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" bigint NOT NULL,
    "processByStaffId" bigint,
    "currencyUnit" character varying(10) DEFAULT 'VND'::character varying NOT NULL,
    description character varying(255),
    "packageChecksumsId" bigint NOT NULL,
    "customerPhone" character varying(10)
);


ALTER TABLE public."Orders" OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 17976)
-- Name: Orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Orders_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Orders_id_seq" OWNER TO postgres;

--
-- TOC entry 3925 (class 0 OID 0)
-- Dependencies: 238
-- Name: Orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Orders_id_seq" OWNED BY public."Orders".id;


--
-- TOC entry 239 (class 1259 OID 17977)
-- Name: PackageChecksums; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PackageChecksums" (
    id bigint NOT NULL,
    "ghnShopId" bigint,
    "shopId" bigint,
    "checksumData" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "expiredAt" timestamp(3) without time zone NOT NULL,
    "isUsed" boolean DEFAULT false NOT NULL,
    "userId" bigint NOT NULL
);


ALTER TABLE public."PackageChecksums" OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 17984)
-- Name: PackageChecksums_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PackageChecksums_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PackageChecksums_id_seq" OWNER TO postgres;

--
-- TOC entry 3926 (class 0 OID 0)
-- Dependencies: 240
-- Name: PackageChecksums_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PackageChecksums_id_seq" OWNED BY public."PackageChecksums".id;


--
-- TOC entry 241 (class 1259 OID 17985)
-- Name: Payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payments" (
    id bigint NOT NULL,
    "orderId" bigint NOT NULL,
    "transactionId" character varying(100) NOT NULL,
    "paymentDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    amount double precision NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "paymentMethod" public."PaymentMethod" DEFAULT 'COD'::public."PaymentMethod" NOT NULL,
    "currencyUnit" character varying(10) DEFAULT 'VND'::character varying NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "vnp_ExpireDate" bigint,
    "vnp_CreateDate" bigint
);


ALTER TABLE public."Payments" OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 17993)
-- Name: Payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Payments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Payments_id_seq" OWNER TO postgres;

--
-- TOC entry 3927 (class 0 OID 0)
-- Dependencies: 242
-- Name: Payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Payments_id_seq" OWNED BY public."Payments".id;


--
-- TOC entry 243 (class 1259 OID 17994)
-- Name: ProductVariants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductVariants" (
    id bigint NOT NULL,
    "productId" bigint NOT NULL,
    "variantName" character varying(100) NOT NULL,
    "variantColor" character varying(100) NOT NULL,
    "variantSize" character varying(100) NOT NULL,
    price double precision NOT NULL,
    stock integer NOT NULL,
    "stockKeepingUnit" character varying(100) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createByUserId" bigint NOT NULL,
    "voucherId" bigint,
    "colorId" bigint NOT NULL,
    "variantHeight" double precision DEFAULT 5 NOT NULL,
    "variantLength" double precision DEFAULT 25 NOT NULL,
    "variantWeight" double precision DEFAULT 250 NOT NULL,
    "variantWidth" double precision DEFAULT 20 NOT NULL,
    "currencyUnit" character varying(10) DEFAULT 'VND'::character varying NOT NULL,
    "isNewProductVariant" boolean DEFAULT true NOT NULL,
    "soldQuantity" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."ProductVariants" OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 18005)
-- Name: ProductVariants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ProductVariants_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ProductVariants_id_seq" OWNER TO postgres;

--
-- TOC entry 3928 (class 0 OID 0)
-- Dependencies: 244
-- Name: ProductVariants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ProductVariants_id_seq" OWNED BY public."ProductVariants".id;


--
-- TOC entry 245 (class 1259 OID 18006)
-- Name: Products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Products" (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price double precision NOT NULL,
    "stockKeepingUnit" character varying(100) NOT NULL,
    stock integer NOT NULL,
    "categoryId" bigint,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createByUserId" bigint NOT NULL,
    "voucherId" bigint,
    "currencyUnit" character varying(10) DEFAULT 'VND'::character varying NOT NULL
);


ALTER TABLE public."Products" OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 18013)
-- Name: Products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Products_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Products_id_seq" OWNER TO postgres;

--
-- TOC entry 3929 (class 0 OID 0)
-- Dependencies: 246
-- Name: Products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Products_id_seq" OWNED BY public."Products".id;


--
-- TOC entry 247 (class 1259 OID 18014)
-- Name: Requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Requests" (
    id bigint NOT NULL,
    "orderId" bigint NOT NULL,
    description text NOT NULL,
    status public."RequestStatus" DEFAULT 'PENDING'::public."RequestStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" bigint NOT NULL,
    "processByStaffId" bigint,
    subject public."RequestType" DEFAULT 'CUSTOMER_SUPPORT'::public."RequestType" NOT NULL
);


ALTER TABLE public."Requests" OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 18022)
-- Name: Requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Requests_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Requests_id_seq" OWNER TO postgres;

--
-- TOC entry 3930 (class 0 OID 0)
-- Dependencies: 248
-- Name: Requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Requests_id_seq" OWNED BY public."Requests".id;


--
-- TOC entry 249 (class 1259 OID 18023)
-- Name: ReturnRequests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReturnRequests" (
    id bigint NOT NULL,
    "requestId" bigint NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "bankAccountName" character varying(100),
    "bankAccountNumber" character varying(50),
    "bankName" public."VietnamBankName"
);


ALTER TABLE public."ReturnRequests" OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 18027)
-- Name: ReturnRequests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ReturnRequests_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ReturnRequests_id_seq" OWNER TO postgres;

--
-- TOC entry 3931 (class 0 OID 0)
-- Dependencies: 250
-- Name: ReturnRequests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ReturnRequests_id_seq" OWNED BY public."ReturnRequests".id;


--
-- TOC entry 251 (class 1259 OID 18028)
-- Name: Reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Reviews" (
    id bigint NOT NULL,
    "productId" bigint NOT NULL,
    "productVariantId" bigint NOT NULL,
    rating integer NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" bigint NOT NULL
);


ALTER TABLE public."Reviews" OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 18034)
-- Name: Reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Reviews_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Reviews_id_seq" OWNER TO postgres;

--
-- TOC entry 3932 (class 0 OID 0)
-- Dependencies: 252
-- Name: Reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Reviews_id_seq" OWNED BY public."Reviews".id;


--
-- TOC entry 253 (class 1259 OID 18035)
-- Name: RoomChat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RoomChat" (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    "isPrivate" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RoomChat" OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 18042)
-- Name: RoomChat_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."RoomChat_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."RoomChat_id_seq" OWNER TO postgres;

--
-- TOC entry 3933 (class 0 OID 0)
-- Dependencies: 254
-- Name: RoomChat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."RoomChat_id_seq" OWNED BY public."RoomChat".id;


--
-- TOC entry 255 (class 1259 OID 18043)
-- Name: ShipmentItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShipmentItems" (
    id bigint NOT NULL,
    "shipmentId" bigint NOT NULL,
    "orderItemId" bigint NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ShipmentItems" OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 18047)
-- Name: ShipmentItems_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ShipmentItems_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ShipmentItems_id_seq" OWNER TO postgres;

--
-- TOC entry 3934 (class 0 OID 0)
-- Dependencies: 256
-- Name: ShipmentItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ShipmentItems_id_seq" OWNED BY public."ShipmentItems".id;


--
-- TOC entry 257 (class 1259 OID 18048)
-- Name: Shipments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Shipments" (
    id bigint NOT NULL,
    "orderId" bigint NOT NULL,
    "estimatedDelivery" timestamp(3) without time zone NOT NULL,
    "deliveredAt" timestamp(3) without time zone,
    "estimatedShipDate" timestamp(3) without time zone NOT NULL,
    "shippedAt" timestamp(3) without time zone,
    carrier character varying(100) NOT NULL,
    "trackingNumber" character varying(100) NOT NULL,
    status public."ShipmentStatus" DEFAULT 'PENDING'::public."ShipmentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "processByStaffId" bigint,
    "ghnOrderCode" character varying(100),
    description character varying(255),
    "ghnPickShiftId" bigint
);


ALTER TABLE public."Shipments" OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 18055)
-- Name: Shipments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Shipments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Shipments_id_seq" OWNER TO postgres;

--
-- TOC entry 3935 (class 0 OID 0)
-- Dependencies: 258
-- Name: Shipments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Shipments_id_seq" OWNED BY public."Shipments".id;


--
-- TOC entry 259 (class 1259 OID 18056)
-- Name: SizeProfiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SizeProfiles" (
    id bigint NOT NULL,
    "heightCm" double precision DEFAULT 0,
    "weightKg" double precision DEFAULT 0,
    "chestCm" double precision DEFAULT 0,
    "hipCm" double precision DEFAULT 0,
    "sleeveLengthCm" double precision DEFAULT 0,
    "inseamCm" double precision DEFAULT 0,
    "shoulderLengthCm" double precision DEFAULT 0,
    "bodyType" character varying(100),
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" bigint NOT NULL
);


ALTER TABLE public."SizeProfiles" OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 18069)
-- Name: SizeProfiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."SizeProfiles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."SizeProfiles_id_seq" OWNER TO postgres;

--
-- TOC entry 3936 (class 0 OID 0)
-- Dependencies: 260
-- Name: SizeProfiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."SizeProfiles_id_seq" OWNED BY public."SizeProfiles".id;


--
-- TOC entry 261 (class 1259 OID 18070)
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id bigint NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    email text NOT NULL,
    phone character varying(10),
    "firstName" character varying(255),
    "lastName" character varying(255),
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    password text,
    username character varying(32) NOT NULL,
    "codeActive" uuid NOT NULL,
    "codeActiveExpire" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    gender public."Gender" DEFAULT 'OTHER'::public."Gender",
    points integer DEFAULT 0 NOT NULL,
    "loyaltyCard" character varying(50),
    "staffCode" character varying(50),
    "googleId" character varying(255)
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 18080)
-- Name: UserRoomChat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserRoomChat" (
    "userId" bigint NOT NULL,
    "roomChatId" bigint NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserRoomChat" OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 18085)
-- Name: UserVouchers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserVouchers" (
    id bigint NOT NULL,
    "voucherId" bigint NOT NULL,
    "useVoucherAt" timestamp(3) without time zone,
    "saveVoucherAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "voucherStatus" public."VoucherStatus" DEFAULT 'SAVED'::public."VoucherStatus" NOT NULL,
    "userId" bigint NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "orderId" bigint
);


ALTER TABLE public."UserVouchers" OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 18091)
-- Name: UserVouchers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."UserVouchers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."UserVouchers_id_seq" OWNER TO postgres;

--
-- TOC entry 3937 (class 0 OID 0)
-- Dependencies: 264
-- Name: UserVouchers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."UserVouchers_id_seq" OWNED BY public."UserVouchers".id;


--
-- TOC entry 265 (class 1259 OID 18092)
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- TOC entry 3938 (class 0 OID 0)
-- Dependencies: 265
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- TOC entry 266 (class 1259 OID 18093)
-- Name: Vouchers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Vouchers" (
    id bigint NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    "discountType" public."DiscountType" DEFAULT 'FIXED_AMOUNT'::public."DiscountType" NOT NULL,
    "discountValue" double precision DEFAULT 0 NOT NULL,
    "validFrom" timestamp(3) without time zone NOT NULL,
    "validTo" timestamp(3) without time zone NOT NULL,
    "usageLimit" integer,
    "timesUsed" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" bigint NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isOverUsageLimit" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Vouchers" OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 18104)
-- Name: Vouchers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Vouchers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Vouchers_id_seq" OWNER TO postgres;

--
-- TOC entry 3939 (class 0 OID 0)
-- Dependencies: 267
-- Name: Vouchers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Vouchers_id_seq" OWNED BY public."Vouchers".id;


--
-- TOC entry 268 (class 1259 OID 18105)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 3444 (class 2604 OID 18112)
-- Name: Address id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address" ALTER COLUMN id SET DEFAULT nextval('public."Address_id_seq"'::regclass);


--
-- TOC entry 3447 (class 2604 OID 18113)
-- Name: Cart id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart" ALTER COLUMN id SET DEFAULT nextval('public."Cart_id_seq"'::regclass);


--
-- TOC entry 3449 (class 2604 OID 18114)
-- Name: CartItems id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItems" ALTER COLUMN id SET DEFAULT nextval('public."CartItems_id_seq"'::regclass);


--
-- TOC entry 3451 (class 2604 OID 18115)
-- Name: Category id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);


--
-- TOC entry 3453 (class 2604 OID 18116)
-- Name: Color id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Color" ALTER COLUMN id SET DEFAULT nextval('public."Color_id_seq"'::regclass);


--
-- TOC entry 3455 (class 2604 OID 18117)
-- Name: GhnPickShift id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GhnPickShift" ALTER COLUMN id SET DEFAULT nextval('public."GhnPickShift_id_seq"'::regclass);


--
-- TOC entry 3457 (class 2604 OID 18118)
-- Name: Media id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media" ALTER COLUMN id SET DEFAULT nextval('public."Media_id_seq"'::regclass);


--
-- TOC entry 3464 (class 2604 OID 18119)
-- Name: Message id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message" ALTER COLUMN id SET DEFAULT nextval('public."Message_id_seq"'::regclass);


--
-- TOC entry 3466 (class 2604 OID 18120)
-- Name: Notification id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification" ALTER COLUMN id SET DEFAULT nextval('public."Notification_id_seq"'::regclass);


--
-- TOC entry 3470 (class 2604 OID 18121)
-- Name: OrderItems id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItems" ALTER COLUMN id SET DEFAULT nextval('public."OrderItems_id_seq"'::regclass);


--
-- TOC entry 3474 (class 2604 OID 18122)
-- Name: Orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders" ALTER COLUMN id SET DEFAULT nextval('public."Orders_id_seq"'::regclass);


--
-- TOC entry 3479 (class 2604 OID 18123)
-- Name: PackageChecksums id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PackageChecksums" ALTER COLUMN id SET DEFAULT nextval('public."PackageChecksums_id_seq"'::regclass);


--
-- TOC entry 3482 (class 2604 OID 18124)
-- Name: Payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments" ALTER COLUMN id SET DEFAULT nextval('public."Payments_id_seq"'::regclass);


--
-- TOC entry 3488 (class 2604 OID 18125)
-- Name: ProductVariants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariants" ALTER COLUMN id SET DEFAULT nextval('public."ProductVariants_id_seq"'::regclass);


--
-- TOC entry 3497 (class 2604 OID 18126)
-- Name: Products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products" ALTER COLUMN id SET DEFAULT nextval('public."Products_id_seq"'::regclass);


--
-- TOC entry 3500 (class 2604 OID 18127)
-- Name: Requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Requests" ALTER COLUMN id SET DEFAULT nextval('public."Requests_id_seq"'::regclass);


--
-- TOC entry 3504 (class 2604 OID 18128)
-- Name: ReturnRequests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReturnRequests" ALTER COLUMN id SET DEFAULT nextval('public."ReturnRequests_id_seq"'::regclass);


--
-- TOC entry 3506 (class 2604 OID 18129)
-- Name: Reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews" ALTER COLUMN id SET DEFAULT nextval('public."Reviews_id_seq"'::regclass);


--
-- TOC entry 3508 (class 2604 OID 18130)
-- Name: RoomChat id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RoomChat" ALTER COLUMN id SET DEFAULT nextval('public."RoomChat_id_seq"'::regclass);


--
-- TOC entry 3511 (class 2604 OID 18131)
-- Name: ShipmentItems id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShipmentItems" ALTER COLUMN id SET DEFAULT nextval('public."ShipmentItems_id_seq"'::regclass);


--
-- TOC entry 3513 (class 2604 OID 18132)
-- Name: Shipments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shipments" ALTER COLUMN id SET DEFAULT nextval('public."Shipments_id_seq"'::regclass);


--
-- TOC entry 3516 (class 2604 OID 18133)
-- Name: SizeProfiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SizeProfiles" ALTER COLUMN id SET DEFAULT nextval('public."SizeProfiles_id_seq"'::regclass);


--
-- TOC entry 3525 (class 2604 OID 18134)
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- TOC entry 3533 (class 2604 OID 18135)
-- Name: UserVouchers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserVouchers" ALTER COLUMN id SET DEFAULT nextval('public."UserVouchers_id_seq"'::regclass);


--
-- TOC entry 3537 (class 2604 OID 18136)
-- Name: Vouchers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vouchers" ALTER COLUMN id SET DEFAULT nextval('public."Vouchers_id_seq"'::regclass);


--
-- TOC entry 3856 (class 0 OID 17899)
-- Dependencies: 217
-- Data for Name: Address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Address" (id, "userId", street, ward, district, province, "zipCode", country, "createdAt", "updatedAt", "isOrderAddress") FROM stdin;
1	1	123 Lê Lợi	Phường Bến Thành	Quận 1	Hồ Chí Minh	70000	Vietnam	2026-04-16 03:27:17.317	2026-04-16 03:27:17.317	f
2	2	456 Trần Hưng Đạo	Phường cửa Nam	Quận Hoàn Kiếm	Hà Nội	10000	Vietnam	2026-04-16 03:27:17.317	2026-04-16 03:27:17.317	f
3	3	789 Điện Biên Phủ	Phường 11	Quận 10	Hồ Chí Minh	70000	Vietnam	2026-04-16 03:27:17.317	2026-04-16 03:27:17.317	f
4	4	12 Nguyễn Văn Linh	Phường Nam Dương	Quận Hải Châu	Đà Nẵng	55000	Vietnam	2026-04-16 03:27:17.317	2026-04-16 03:27:17.317	f
5	5	34 Hùng Vương	Phường Thới Bình	Quận Ninh Kiều	Cần Thơ	90000	Vietnam	2026-04-16 03:27:17.317	2026-04-16 03:27:17.317	f
6	6	56 Quang Trung	Phường Lộc Thọ	TP. Nha Trang	Khánh Hòa	65000	Vietnam	2026-04-16 03:27:17.317	2026-04-16 03:27:17.317	f
7	7	89 Lê Duẩn	Phường Chính Gián	Quận Thanh Khê	Đà Nẵng	55000	Vietnam	2026-04-16 03:27:17.317	2026-04-16 03:27:17.317	f
8	8	101 Cách Mạng Tháng 8	Phường 15	Quận 10	Hồ Chí Minh	70000	Vietnam	2026-04-16 03:27:17.317	2026-04-16 03:27:17.317	f
9	9	202 Lý Thường Kiệt	Phường 6	TP. Mỹ Tho	Tiền Giang	86000	Vietnam	2026-04-16 03:27:17.317	2026-04-16 03:27:17.317	f
10	10	303 Tôn Đức Thắng	Phường Hòa Minh	Quận Liên Chiểu	Đà Nẵng	55000	Vietnam	2026-04-16 03:27:17.317	2026-04-16 03:27:17.317	f
5011	11	Đường Mạc Đỉnh Chi	Phường Đông Hòa	Thành phố Dĩ An	Tỉnh Bình Dương	52000	Vietnam	2026-04-22 07:45:52.157	2026-04-22 07:45:52.157	f
5012	11	Đường Mạc Đỉnh Chi	Phường Đông Hòa	Thành phố Dĩ An	Tỉnh Bình Dương	52000	Vietnam	2026-04-22 07:45:54.067	2026-04-22 07:45:54.067	t
5044	11	Đường Mạc Đỉnh Chi	Phường Đông Hòa	Thành phố Dĩ An	Tỉnh Bình Dương	52000	Vietnam	2026-04-22 08:03:58.85	2026-04-22 08:03:58.85	t
5045	11	Đường Mạc Đỉnh Chi	Phường Đông Hòa	Thành phố Dĩ An	Tỉnh Bình Dương	52000	Vietnam	2026-04-22 08:08:44.594	2026-04-22 08:08:44.594	t
5046	11	Đường Mạc Đỉnh Chi	Phường Đông Hòa	Thành phố Dĩ An	Tỉnh Bình Dương	52000	Vietnam	2026-04-22 08:10:43.386	2026-04-22 08:10:43.386	t
5047	11	Đường Mạc Đỉnh Chi	Phường Đông Hòa	Thành phố Dĩ An	Tỉnh Bình Dương	52000	Vietnam	2026-04-22 08:15:54.697	2026-04-22 08:15:54.697	t
5048	11	Đường Mạc Đỉnh Chi	Phường Đông Hòa	Thành phố Dĩ An	Tỉnh Bình Dương	52000	Vietnam	2026-04-22 08:32:23.118	2026-04-22 08:32:23.118	t
5049	11	Đường Mạc Đỉnh Chi	Phường Đông Hòa	Thành phố Dĩ An	Tỉnh Bình Dương	52000	Vietnam	2026-04-22 09:12:59.913	2026-04-22 09:12:59.913	t
5050	11	Đường Mạc Đỉnh Chi	Phường Đông Hòa	Thành phố Dĩ An	Tỉnh Bình Dương	52000	Vietnam	2026-04-22 09:46:29.47	2026-04-22 09:46:29.47	t
5051	11	Đường Mạc Đỉnh Chi	Phường Đông Hòa	Thành phố Dĩ An	Tỉnh Bình Dương	52000	Vietnam	2026-04-22 09:47:18.418	2026-04-22 09:47:18.418	t
5052	11	Đường Mạc Đỉnh Chi	Phường Đông Hòa	Thành phố Dĩ An	Tỉnh Bình Dương	52000	Vietnam	2026-04-22 09:50:32.599	2026-04-22 09:50:32.599	t
5053	11	Đường Mạc Đỉnh Chi	Phường Đông Hòa	Thành phố Dĩ An	Tỉnh Bình Dương	52000	Vietnam	2026-04-22 09:53:26.934	2026-04-22 09:53:26.934	t
5054	11	Đường Mạc Đỉnh Chi	Phường Đông Hòa	Thành phố Dĩ An	Tỉnh Bình Dương	52000	Vietnam	2026-04-22 09:54:09.489	2026-04-22 09:54:09.489	t
5055	11	Đường Mạc Đỉnh Chi	Phường Đông Hòa	Thành phố Dĩ An	Tỉnh Bình Dương	52000	Vietnam	2026-04-22 09:56:05.183	2026-04-22 09:56:05.183	t
5056	11	Đường Mạc Đỉnh Chi	Phường Đông Hòa	Thành phố Dĩ An	Tỉnh Bình Dương	52000	Vietnam	2026-04-24 15:28:23.757	2026-04-24 15:28:23.757	t
\.


--
-- TOC entry 3858 (class 0 OID 17907)
-- Dependencies: 219
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Cart" (id, "createdAt", "updatedAt", "userId") FROM stdin;
1	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	3
2	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	4
3	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	5
4	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	6
5	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	7
6	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	8
7	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	9
8	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	10
9	2026-04-22 08:07:49.775	2026-04-22 08:07:49.775	11
\.


--
-- TOC entry 3859 (class 0 OID 17911)
-- Dependencies: 220
-- Data for Name: CartItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CartItems" (id, "cartId", "productVariantId", quantity, "createdAt", "updatedAt") FROM stdin;
12	5	403	2	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
20	7	514	1	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
21	7	821	2	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
22	8	413	2	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
24	8	410	1	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
\.


--
-- TOC entry 3862 (class 0 OID 17917)
-- Dependencies: 223
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, name, description, "parentId", "createdAt", "updatedAt", "createByUserId", "voucherId") FROM stdin;
3	Áo Thun & Polo	Các loại áo thun basic, áo polo nam nữ chất liệu cotton thoáng mát	\N	2026-04-16 02:51:39.21	2026-04-16 02:51:39.21	1	\N
4	Áo Sơ Mi	Sơ mi công sở, sơ mi flannel và sơ mi kiểu thời trang	\N	2026-04-16 02:51:39.21	2026-04-16 02:51:39.21	1	\N
5	Quần Jeans	Quần jeans ống rộng, skinny, baggy bền đẹp	\N	2026-04-16 02:51:39.21	2026-04-16 02:51:39.21	1	\N
6	Quần Tây & Kaki	Quần dài lịch sự cho đi học, đi làm	\N	2026-04-16 02:51:39.21	2026-04-16 02:51:39.21	1	\N
7	Giày Thể Thao	Sneakers năng động từ các thương hiệu phổ biến	\N	2026-04-16 02:51:39.21	2026-04-16 02:51:39.21	1	\N
8	Giày Tây & Giày Da	Giày lười, giày Oxford sang trọng	\N	2026-04-16 02:51:39.21	2026-04-16 02:51:39.21	1	\N
9	Nón & Mũ	Nón kết (mũ lưỡi trai), nón len, nón bucket thời thượng	\N	2026-04-16 02:51:39.21	2026-04-16 02:51:39.21	1	\N
10	Phụ Kiện Thời Trang	Thắt lưng, ví da, tất vớ và trang sức	\N	2026-04-16 02:51:39.21	2026-04-16 02:51:39.21	1	\N
11	Áo Khoác & Hoodie	Áo gió, áo nỉ hoodie giữ ấm cho mùa đông	\N	2026-04-16 02:51:39.21	2026-04-16 02:51:39.21	1	\N
\.


--
-- TOC entry 3864 (class 0 OID 17924)
-- Dependencies: 225
-- Data for Name: Color; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Color" (id, name, "hexCode", "createdAt", "updatedAt") FROM stdin;
1	Đen Tuyền	#000000	2026-04-16 02:51:55.222	2026-04-16 02:51:55.222
2	Trắng Basic	#FFFFFF	2026-04-16 02:51:55.222	2026-04-16 02:51:55.222
3	Đỏ Đô	#8B0000	2026-04-16 02:51:55.222	2026-04-16 02:51:55.222
4	Xanh Navy	#000080	2026-04-16 02:51:55.222	2026-04-16 02:51:55.222
5	Xám Khói	#808080	2026-04-16 02:51:55.222	2026-04-16 02:51:55.222
6	Be (Cream)	#F5F5DC	2026-04-16 02:51:55.222	2026-04-16 02:51:55.222
7	Xanh Rêu	#556B2F	2026-04-16 02:51:55.222	2026-04-16 02:51:55.222
8	Hồng Pastel	#FFD1DC	2026-04-16 02:51:55.222	2026-04-16 02:51:55.222
9	Nâu Đất	#A52A2A	2026-04-16 02:51:55.222	2026-04-16 02:51:55.222
10	Vàng Mù Tạt	#E1AD01	2026-04-16 02:51:55.222	2026-04-16 02:51:55.222
\.


--
-- TOC entry 3866 (class 0 OID 17929)
-- Dependencies: 227
-- Data for Name: GhnPickShift; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."GhnPickShift" (id, "ghnShiftId", "ghnTitle", "ghnFromTime", "ghnToTime", "createdAt", "updatedAt") FROM stdin;
1	1001	Ca sáng (08:00 - 12:00)	1713315600	1713330000	2026-04-17 05:54:02.579	2026-04-17 05:54:02.579
2	1002	Ca chiều (14:00 - 18:00)	1713337200	1713351600	2026-04-17 05:54:02.579	2026-04-17 05:54:02.579
3	2	Ca lấy 22-04-2026 (12h00 - 18h00)	43200	64800	2026-04-22 08:01:14.972	2026-04-22 08:01:14.972
4	2	Ca lấy 22-04-2026 (12h00 - 18h00)	43200	64800	2026-04-22 08:05:31.593	2026-04-22 08:05:31.593
5	4	Ca lấy 23-04-2026 (12h00 - 18h00)	129600	151200	2026-04-22 09:21:22.918	2026-04-22 09:21:22.918
6	2	Ca lấy 22-04-2026 (12h00 - 18h00)	43200	64800	2026-04-22 09:48:37.626	2026-04-22 09:48:37.626
7	2	Ca lấy 22-04-2026 (12h00 - 18h00)	43200	64800	2026-04-22 09:48:59.506	2026-04-22 09:48:59.506
8	2	Ca lấy 22-04-2026 (12h00 - 18h00)	43200	64800	2026-04-22 09:55:25.128	2026-04-22 09:55:25.128
9	2	Ca lấy 22-04-2026 (12h00 - 18h00)	43200	64800	2026-04-22 09:55:30.793	2026-04-22 09:55:30.793
10	2	Ca lấy 22-04-2026 (12h00 - 18h00)	43200	64800	2026-04-22 09:57:28.025	2026-04-22 09:57:28.025
\.


--
-- TOC entry 3868 (class 0 OID 17934)
-- Dependencies: 229
-- Data for Name: Media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Media" (id, url, "reviewId", "userId", "productVariantId", "createdAt", "updatedAt", type, "isShopBanner", "isShopLogo", "isCategoryFile", "isAvatarFile", "requestId", "productId") FROM stdin;
1	shops/shop-products/product-images/82/photo-1523381294911-8d3cead13475.jfif	\N	13	\N	2026-04-16 11:50:55.049	2026-04-16 11:50:55.049	IMAGE	f	f	f	f	\N	82
2	shops/shop-products/product-images/901/photo-1583743814966-8936f5b7be1a.jfif	\N	13	901	2026-04-16 11:50:57.46	2026-04-16 11:50:57.46	IMAGE	f	f	f	f	\N	\N
3	shops/shop-products/product-images/904/photo-1519568470290-c0c1fbfff16f.jfif	\N	13	904	2026-04-16 11:50:58.253	2026-04-16 11:50:58.253	IMAGE	f	f	f	f	\N	\N
4	shops/shop-products/product-images/401/photo-1519568470290-c0c1fbfff16f.jfif	\N	13	401	2026-04-16 11:50:58.396	2026-04-16 11:50:58.396	IMAGE	f	f	f	f	\N	\N
5	shops/shop-products/product-images/902/photo-1596566638409-fc1426bf6574.jfif	\N	13	902	2026-04-16 11:50:58.931	2026-04-16 11:50:58.931	IMAGE	f	f	f	f	\N	\N
6	shops/shop-products/product-images/907/photo-1596566638409-fc1426bf6574.jfif	\N	13	907	2026-04-16 11:51:01.75	2026-04-16 11:51:01.75	IMAGE	f	f	f	f	\N	\N
7	shops/shop-products/product-images/903/photo-1622351772377-c3dda74beb03.jfif	\N	13	903	2026-04-16 11:51:03.031	2026-04-16 11:51:03.031	IMAGE	f	f	f	f	\N	\N
8	shops/shop-products/product-images/909/photo-1519568470290-c0c1fbfff16f.jfif	\N	13	909	2026-04-16 11:51:03.142	2026-04-16 11:51:03.142	IMAGE	f	f	f	f	\N	\N
9	shops/shop-products/product-images/911/photo-1596566638409-fc1426bf6574.jfif	\N	13	911	2026-04-16 11:51:05.206	2026-04-16 11:51:05.206	IMAGE	f	f	f	f	\N	\N
10	shops/shop-products/product-images/905/photo-1598082943498-daf3e5014ae4 (2).jfif	\N	13	905	2026-04-16 11:51:05.363	2026-04-16 11:51:05.363	IMAGE	f	f	f	f	\N	\N
11	shops/shop-products/product-images/910/photo-1583743814966-8936f5b7be1a.jfif	\N	13	910	2026-04-16 11:51:06.495	2026-04-16 11:51:06.495	IMAGE	f	f	f	f	\N	\N
12	shops/shop-products/product-images/912/photo-1622351772377-c3dda74beb03.jfif	\N	13	912	2026-04-16 11:51:06.997	2026-04-16 11:51:06.997	IMAGE	f	f	f	f	\N	\N
13	shops/shop-products/product-images/906/photo-1598082943498-daf3e5014ae4 (2).jfif	\N	13	906	2026-04-16 11:51:07.021	2026-04-16 11:51:07.021	IMAGE	f	f	f	f	\N	\N
14	shops/shop-products/product-images/908/photo-1622351772377-c3dda74beb03.jfif	\N	13	908	2026-04-16 11:51:07.902	2026-04-16 11:51:07.902	IMAGE	f	f	f	f	\N	\N
15	shops/shop-products/product-images/913/photo-1519568470290-c0c1fbfff16f.jfif	\N	13	913	2026-04-16 11:51:08.76	2026-04-16 11:51:08.76	IMAGE	f	f	f	f	\N	\N
16	shops/shop-products/product-images/918/photo-1583743814966-8936f5b7be1a.jfif	\N	13	918	2026-04-16 11:51:09.588	2026-04-16 11:51:09.588	IMAGE	f	f	f	f	\N	\N
17	shops/shop-products/product-images/914/photo-1583743814966-8936f5b7be1a.jfif	\N	13	914	2026-04-16 11:51:10.277	2026-04-16 11:51:10.277	IMAGE	f	f	f	f	\N	\N
18	shops/shop-products/product-images/402/photo-1583743814966-8936f5b7be1a.jfif	\N	13	402	2026-04-16 11:51:11.94	2026-04-16 11:51:11.94	IMAGE	f	f	f	f	\N	\N
19	shops/shop-products/product-images/917/photo-1519568470290-c0c1fbfff16f.jfif	\N	13	917	2026-04-16 11:51:14.039	2026-04-16 11:51:14.039	IMAGE	f	f	f	f	\N	\N
20	shops/shop-products/product-images/920/photo-1596566638409-fc1426bf6574.jfif	\N	13	920	2026-04-16 11:51:14.745	2026-04-16 11:51:14.745	IMAGE	f	f	f	f	\N	\N
21	shops/shop-products/product-images/916/photo-1622351772377-c3dda74beb03.jfif	\N	13	916	2026-04-16 11:51:17.224	2026-04-16 11:51:17.224	IMAGE	f	f	f	f	\N	\N
22	shops/shop-products/product-images/919/photo-1598082943498-daf3e5014ae4 (2).jfif	\N	13	919	2026-04-16 11:51:17.346	2026-04-16 11:51:17.346	IMAGE	f	f	f	f	\N	\N
23	shops/shop-products/product-images/404/photo-1596566638409-fc1426bf6574.jfif	\N	13	404	2026-04-16 11:51:18.386	2026-04-16 11:51:18.386	IMAGE	f	f	f	f	\N	\N
24	shops/shop-products/product-images/915/photo-1598082943498-daf3e5014ae4 (2).jfif	\N	13	915	2026-04-16 11:51:19.184	2026-04-16 11:51:19.184	IMAGE	f	f	f	f	\N	\N
25	shops/shop-products/product-images/403/photo-1598082943498-daf3e5014ae4 (2).jfif	\N	13	403	2026-04-16 11:51:20.929	2026-04-16 11:51:20.929	IMAGE	f	f	f	f	\N	\N
26	shops/shop-products/product-images/405/photo-1622351772377-c3dda74beb03.jfif	\N	13	405	2026-04-16 11:51:20.998	2026-04-16 11:51:20.998	IMAGE	f	f	f	f	\N	\N
27	shops/shop-products/product-images/83/photo-1571945153237-4929e783af4a.jfif	\N	13	\N	2026-04-16 12:29:20.269	2026-04-16 12:29:20.269	IMAGE	f	f	f	f	\N	83
28	shops/shop-products/product-images/410/81082da398a381da0378fafc46e01463.jpg	\N	13	410	2026-04-16 12:29:21.484	2026-04-16 12:29:21.484	IMAGE	f	f	f	f	\N	\N
29	shops/shop-products/product-images/408/e1f154c53f4874c7cc9f3274e7f0e9f8.jpg	\N	13	408	2026-04-16 12:29:21.548	2026-04-16 12:29:21.548	IMAGE	f	f	f	f	\N	\N
30	shops/shop-products/product-images/406/1b02bde20d859c8515b61cbc97b95378.jpg	\N	13	406	2026-04-16 12:29:22.213	2026-04-16 12:29:22.213	IMAGE	f	f	f	f	\N	\N
31	shops/shop-products/product-images/409/photo-1586363104862-3a5e2ab60d99.jfif	\N	13	409	2026-04-16 12:29:22.658	2026-04-16 12:29:22.658	IMAGE	f	f	f	f	\N	\N
32	shops/shop-products/product-images/407/photo-1559398082-8dc0babba32c.jfif	\N	13	407	2026-04-16 12:29:24.234	2026-04-16 12:29:24.234	IMAGE	f	f	f	f	\N	\N
33	shops/shop-products/product-images/84/388851d8c5fda64694fdb64bb4fb90e6.jpg	\N	13	\N	2026-04-17 00:43:21.988	2026-04-17 00:43:21.988	IMAGE	f	f	f	f	\N	84
34	shops/shop-products/product-images/922/0c382ef4d80d2961cdd63b247c83b7dc.png	\N	13	922	2026-04-17 00:43:23.84	2026-04-17 00:43:23.84	IMAGE	f	f	f	f	\N	\N
35	shops/shop-products/product-images/411/photo-1586363090844-099253d6a1cb.jfif	\N	13	411	2026-04-17 00:43:25.236	2026-04-17 00:43:25.236	IMAGE	f	f	f	f	\N	\N
36	shops/shop-products/product-images/925/photo-1586363090844-099253d6a1cb.jfif	\N	13	925	2026-04-17 00:43:26.238	2026-04-17 00:43:26.238	IMAGE	f	f	f	f	\N	\N
37	shops/shop-products/product-images/927/0c382ef4d80d2961cdd63b247c83b7dc.png	\N	13	927	2026-04-17 00:43:26.604	2026-04-17 00:43:26.604	IMAGE	f	f	f	f	\N	\N
38	shops/shop-products/product-images/926/photo-1586363104862-3a5e2ab60d99.jfif	\N	13	926	2026-04-17 00:43:26.99	2026-04-17 00:43:26.99	IMAGE	f	f	f	f	\N	\N
39	shops/shop-products/product-images/923/photo-1586363104862-3a5e2ab60d99.jfif	\N	13	923	2026-04-17 00:43:27.251	2026-04-17 00:43:27.251	IMAGE	f	f	f	f	\N	\N
40	shops/shop-products/product-images/921/photo-1612653705450-82745d3d4e6a.jfif	\N	13	921	2026-04-17 00:43:28.935	2026-04-17 00:43:28.935	IMAGE	f	f	f	f	\N	\N
41	shops/shop-products/product-images/931/0c382ef4d80d2961cdd63b247c83b7dc.png	\N	13	931	2026-04-17 00:43:29.048	2026-04-17 00:43:29.048	IMAGE	f	f	f	f	\N	\N
42	shops/shop-products/product-images/929/photo-1586363090844-099253d6a1cb.jfif	\N	13	929	2026-04-17 00:43:29.761	2026-04-17 00:43:29.761	IMAGE	f	f	f	f	\N	\N
43	shops/shop-products/product-images/924/photo-1596566638409-fc1426bf6574.jfif	\N	13	924	2026-04-17 00:43:30.088	2026-04-17 00:43:30.088	IMAGE	f	f	f	f	\N	\N
44	shops/shop-products/product-images/932/photo-1596566638409-fc1426bf6574.jfif	\N	13	932	2026-04-17 00:43:31.402	2026-04-17 00:43:31.402	IMAGE	f	f	f	f	\N	\N
45	shops/shop-products/product-images/935/photo-1586363104862-3a5e2ab60d99.jfif	\N	13	935	2026-04-17 00:43:32.462	2026-04-17 00:43:32.462	IMAGE	f	f	f	f	\N	\N
46	shops/shop-products/product-images/928/photo-1596566638409-fc1426bf6574.jfif	\N	13	928	2026-04-17 00:43:32.969	2026-04-17 00:43:32.969	IMAGE	f	f	f	f	\N	\N
47	shops/shop-products/product-images/933/photo-1586363090844-099253d6a1cb.jfif	\N	13	933	2026-04-17 00:43:33.234	2026-04-17 00:43:33.234	IMAGE	f	f	f	f	\N	\N
48	shops/shop-products/product-images/934/photo-1612653705450-82745d3d4e6a.jfif	\N	13	934	2026-04-17 00:43:34.768	2026-04-17 00:43:34.768	IMAGE	f	f	f	f	\N	\N
49	shops/shop-products/product-images/930/photo-1612653705450-82745d3d4e6a.jfif	\N	13	930	2026-04-17 00:43:35.549	2026-04-17 00:43:35.549	IMAGE	f	f	f	f	\N	\N
50	shops/shop-products/product-images/940/0c382ef4d80d2961cdd63b247c83b7dc.png	\N	13	940	2026-04-17 00:43:36.763	2026-04-17 00:43:36.763	IMAGE	f	f	f	f	\N	\N
51	shops/shop-products/product-images/936/photo-1596566638409-fc1426bf6574.jfif	\N	13	936	2026-04-17 00:43:37.599	2026-04-17 00:43:37.599	IMAGE	f	f	f	f	\N	\N
52	shops/shop-products/product-images/414/0c382ef4d80d2961cdd63b247c83b7dc.png	\N	13	414	2026-04-17 00:43:39.341	2026-04-17 00:43:39.341	IMAGE	f	f	f	f	\N	\N
53	shops/shop-products/product-images/939/photo-1586363104862-3a5e2ab60d99.jfif	\N	13	939	2026-04-17 00:43:39.697	2026-04-17 00:43:39.697	IMAGE	f	f	f	f	\N	\N
54	shops/shop-products/product-images/938/photo-1612653705450-82745d3d4e6a.jfif	\N	13	938	2026-04-17 00:43:39.735	2026-04-17 00:43:39.735	IMAGE	f	f	f	f	\N	\N
55	shops/shop-products/product-images/413/photo-1586363104862-3a5e2ab60d99.jfif	\N	13	413	2026-04-17 00:43:39.849	2026-04-17 00:43:39.849	IMAGE	f	f	f	f	\N	\N
56	shops/shop-products/product-images/937/photo-1586363090844-099253d6a1cb.jfif	\N	13	937	2026-04-17 00:43:39.904	2026-04-17 00:43:39.904	IMAGE	f	f	f	f	\N	\N
57	shops/shop-products/product-images/415/photo-1596566638409-fc1426bf6574.jfif	\N	13	415	2026-04-17 00:43:41.258	2026-04-17 00:43:41.258	IMAGE	f	f	f	f	\N	\N
58	shops/shop-products/product-images/412/photo-1612653705450-82745d3d4e6a.jfif	\N	13	412	2026-04-17 00:43:41.419	2026-04-17 00:43:41.419	IMAGE	f	f	f	f	\N	\N
59	shops/shop-products/product-images/85/3c29b0c95e1d1abd066451950b8d092b.jpg	\N	13	\N	2026-04-17 00:46:41.299	2026-04-17 00:46:41.299	IMAGE	f	f	f	f	\N	85
60	shops/shop-products/product-images/942/e1f154c53f4874c7cc9f3274e7f0e9f8.jpg	\N	13	942	2026-04-17 00:46:42.688	2026-04-17 00:46:42.688	IMAGE	f	f	f	f	\N	\N
61	shops/shop-products/product-images/943/ac5ad84085ffc961f5a683abd1fd5d8b.jpg	\N	13	943	2026-04-17 00:46:42.762	2026-04-17 00:46:42.762	IMAGE	f	f	f	f	\N	\N
62	shops/shop-products/product-images/946/ac5ad84085ffc961f5a683abd1fd5d8b.jpg	\N	13	946	2026-04-17 00:46:43.584	2026-04-17 00:46:43.584	IMAGE	f	f	f	f	\N	\N
63	shops/shop-products/product-images/947/e1f154c53f4874c7cc9f3274e7f0e9f8.jpg	\N	13	947	2026-04-17 00:46:43.621	2026-04-17 00:46:43.621	IMAGE	f	f	f	f	\N	\N
64	shops/shop-products/product-images/945/premium_photo-1664546293779-aa61c12975de.jfif	\N	13	945	2026-04-17 00:46:44.674	2026-04-17 00:46:44.674	IMAGE	f	f	f	f	\N	\N
65	shops/shop-products/product-images/416/premium_photo-1664546293779-aa61c12975de.jfif	\N	13	416	2026-04-17 00:46:44.882	2026-04-17 00:46:44.882	IMAGE	f	f	f	f	\N	\N
66	shops/shop-products/product-images/948/photo-1562157873-818bc0726f68.jfif	\N	13	948	2026-04-17 00:46:45.61	2026-04-17 00:46:45.61	IMAGE	f	f	f	f	\N	\N
67	shops/shop-products/product-images/951/e1f154c53f4874c7cc9f3274e7f0e9f8.jpg	\N	13	951	2026-04-17 00:46:45.741	2026-04-17 00:46:45.741	IMAGE	f	f	f	f	\N	\N
68	shops/shop-products/product-images/941/photo-1622351772377-c3dda74beb03.jfif	\N	13	941	2026-04-17 00:46:45.846	2026-04-17 00:46:45.846	IMAGE	f	f	f	f	\N	\N
69	shops/shop-products/product-images/944/photo-1562157873-818bc0726f68.jfif	\N	13	944	2026-04-17 00:46:46.1	2026-04-17 00:46:46.1	IMAGE	f	f	f	f	\N	\N
70	shops/shop-products/product-images/955/ac5ad84085ffc961f5a683abd1fd5d8b.jpg	\N	13	955	2026-04-17 00:46:46.433	2026-04-17 00:46:46.433	IMAGE	f	f	f	f	\N	\N
71	shops/shop-products/product-images/949/premium_photo-1664546293779-aa61c12975de.jfif	\N	13	949	2026-04-17 00:46:47.695	2026-04-17 00:46:47.695	IMAGE	f	f	f	f	\N	\N
72	shops/shop-products/product-images/952/photo-1562157873-818bc0726f68.jfif	\N	13	952	2026-04-17 00:46:48.408	2026-04-17 00:46:48.408	IMAGE	f	f	f	f	\N	\N
73	shops/shop-products/product-images/957/premium_photo-1664546293779-aa61c12975de.jfif	\N	13	957	2026-04-17 00:46:49.556	2026-04-17 00:46:49.556	IMAGE	f	f	f	f	\N	\N
74	shops/shop-products/product-images/956/photo-1562157873-818bc0726f68.jfif	\N	13	956	2026-04-17 00:46:49.998	2026-04-17 00:46:49.998	IMAGE	f	f	f	f	\N	\N
75	shops/shop-products/product-images/950/photo-1622351772377-c3dda74beb03.jfif	\N	13	950	2026-04-17 00:46:50.306	2026-04-17 00:46:50.306	IMAGE	f	f	f	f	\N	\N
76	shops/shop-products/product-images/959/ac5ad84085ffc961f5a683abd1fd5d8b.jpg	\N	13	959	2026-04-17 00:46:50.564	2026-04-17 00:46:50.564	IMAGE	f	f	f	f	\N	\N
77	shops/shop-products/product-images/954/photo-1622351772377-c3dda74beb03.jfif	\N	13	954	2026-04-17 00:46:51.034	2026-04-17 00:46:51.034	IMAGE	f	f	f	f	\N	\N
78	shops/shop-products/product-images/418/ac5ad84085ffc961f5a683abd1fd5d8b.jpg	\N	13	418	2026-04-17 00:46:51.215	2026-04-17 00:46:51.215	IMAGE	f	f	f	f	\N	\N
79	shops/shop-products/product-images/953/premium_photo-1664546293779-aa61c12975de.jfif	\N	13	953	2026-04-17 00:46:51.326	2026-04-17 00:46:51.326	IMAGE	f	f	f	f	\N	\N
80	shops/shop-products/product-images/419/e1f154c53f4874c7cc9f3274e7f0e9f8.jpg	\N	13	419	2026-04-17 00:46:51.766	2026-04-17 00:46:51.766	IMAGE	f	f	f	f	\N	\N
81	shops/shop-products/product-images/958/photo-1622351772377-c3dda74beb03.jfif	\N	13	958	2026-04-17 00:46:52.33	2026-04-17 00:46:52.33	IMAGE	f	f	f	f	\N	\N
82	shops/shop-products/product-images/960/e1f154c53f4874c7cc9f3274e7f0e9f8.jpg	\N	13	960	2026-04-17 00:46:52.62	2026-04-17 00:46:52.62	IMAGE	f	f	f	f	\N	\N
83	shops/shop-products/product-images/420/photo-1562157873-818bc0726f68.jfif	\N	13	420	2026-04-17 00:46:52.668	2026-04-17 00:46:52.668	IMAGE	f	f	f	f	\N	\N
84	shops/shop-products/product-images/417/photo-1622351772377-c3dda74beb03.jfif	\N	13	417	2026-04-17 00:46:54.111	2026-04-17 00:46:54.111	IMAGE	f	f	f	f	\N	\N
85	shops/shop-products/product-images/86/8f80754f0962562dee2c329c007bf3b7.jpg	\N	13	\N	2026-04-17 00:55:58.23	2026-04-17 00:55:58.23	IMAGE	f	f	f	f	\N	86
86	shops/shop-products/product-images/961/55e9b1be371cb59339d413664a8dca41.jpg	\N	13	961	2026-04-17 00:55:59.433	2026-04-17 00:55:59.433	IMAGE	f	f	f	f	\N	\N
87	shops/shop-products/product-images/965/photo-1519568470290-c0c1fbfff16f.jfif	\N	13	965	2026-04-17 00:56:01.001	2026-04-17 00:56:01.001	IMAGE	f	f	f	f	\N	\N
88	shops/shop-products/product-images/421/photo-1586363104862-3a5e2ab60d99.jfif	\N	13	421	2026-04-17 00:56:01.767	2026-04-17 00:56:01.767	IMAGE	f	f	f	f	\N	\N
89	shops/shop-products/product-images/966/photo-1562157873-818bc0726f68.jfif	\N	13	966	2026-04-17 00:56:01.98	2026-04-17 00:56:01.98	IMAGE	f	f	f	f	\N	\N
90	shops/shop-products/product-images/969/55e9b1be371cb59339d413664a8dca41.jpg	\N	13	969	2026-04-17 00:56:02.452	2026-04-17 00:56:02.452	IMAGE	f	f	f	f	\N	\N
91	shops/shop-products/product-images/962/photo-1562157873-818bc0726f68.jfif	\N	13	962	2026-04-17 00:56:02.582	2026-04-17 00:56:02.582	IMAGE	f	f	f	f	\N	\N
92	shops/shop-products/product-images/963/d4e4fd623af180946c9f51de85d295d2.jpg	\N	13	963	2026-04-17 00:56:02.828	2026-04-17 00:56:02.828	IMAGE	f	f	f	f	\N	\N
93	shops/shop-products/product-images/972/d4e4fd623af180946c9f51de85d295d2.jpg	\N	13	972	2026-04-17 00:56:03.997	2026-04-17 00:56:03.997	IMAGE	f	f	f	f	\N	\N
94	shops/shop-products/product-images/967/d4e4fd623af180946c9f51de85d295d2.jpg	\N	13	967	2026-04-17 00:56:04.271	2026-04-17 00:56:04.271	IMAGE	f	f	f	f	\N	\N
95	shops/shop-products/product-images/964/photo-1586363104862-3a5e2ab60d99.jfif	\N	13	964	2026-04-17 00:56:04.316	2026-04-17 00:56:04.316	IMAGE	f	f	f	f	\N	\N
96	shops/shop-products/product-images/968/photo-1586363104862-3a5e2ab60d99.jfif	\N	13	968	2026-04-17 00:56:04.871	2026-04-17 00:56:04.871	IMAGE	f	f	f	f	\N	\N
97	shops/shop-products/product-images/974/55e9b1be371cb59339d413664a8dca41.jpg	\N	13	974	2026-04-17 00:56:05.02	2026-04-17 00:56:05.02	IMAGE	f	f	f	f	\N	\N
98	shops/shop-products/product-images/970/photo-1519568470290-c0c1fbfff16f.jfif	\N	13	970	2026-04-17 00:56:06.291	2026-04-17 00:56:06.291	IMAGE	f	f	f	f	\N	\N
99	shops/shop-products/product-images/971/photo-1562157873-818bc0726f68.jfif	\N	13	971	2026-04-17 00:56:06.373	2026-04-17 00:56:06.373	IMAGE	f	f	f	f	\N	\N
100	shops/shop-products/product-images/976/d4e4fd623af180946c9f51de85d295d2.jpg	\N	13	976	2026-04-17 00:56:07.057	2026-04-17 00:56:07.057	IMAGE	f	f	f	f	\N	\N
101	shops/shop-products/product-images/978/55e9b1be371cb59339d413664a8dca41.jpg	\N	13	978	2026-04-17 00:56:07.123	2026-04-17 00:56:07.123	IMAGE	f	f	f	f	\N	\N
102	shops/shop-products/product-images/973/photo-1586363104862-3a5e2ab60d99.jfif	\N	13	973	2026-04-17 00:56:07.752	2026-04-17 00:56:07.752	IMAGE	f	f	f	f	\N	\N
103	shops/shop-products/product-images/975/photo-1519568470290-c0c1fbfff16f.jfif	\N	13	975	2026-04-17 00:56:08.254	2026-04-17 00:56:08.254	IMAGE	f	f	f	f	\N	\N
104	shops/shop-products/product-images/422/55e9b1be371cb59339d413664a8dca41.jpg	\N	13	422	2026-04-17 00:56:08.313	2026-04-17 00:56:08.313	IMAGE	f	f	f	f	\N	\N
105	shops/shop-products/product-images/977/photo-1586363104862-3a5e2ab60d99.jfif	\N	13	977	2026-04-17 00:56:08.424	2026-04-17 00:56:08.424	IMAGE	f	f	f	f	\N	\N
106	shops/shop-products/product-images/979/photo-1519568470290-c0c1fbfff16f.jfif	\N	13	979	2026-04-17 00:56:09.365	2026-04-17 00:56:09.365	IMAGE	f	f	f	f	\N	\N
107	shops/shop-products/product-images/425/d4e4fd623af180946c9f51de85d295d2.jpg	\N	13	425	2026-04-17 00:56:10.455	2026-04-17 00:56:10.455	IMAGE	f	f	f	f	\N	\N
109	shops/shop-products/product-images/980/photo-1562157873-818bc0726f68.jfif	\N	13	980	2026-04-17 00:56:10.737	2026-04-17 00:56:10.737	IMAGE	f	f	f	f	\N	\N
110	shops/shop-products/product-images/424/photo-1562157873-818bc0726f68.jfif	\N	13	424	2026-04-17 00:56:10.95	2026-04-17 00:56:10.95	IMAGE	f	f	f	f	\N	\N
108	shops/shop-products/product-images/423/photo-1519568470290-c0c1fbfff16f.jfif	\N	13	423	2026-04-17 00:56:10.465	2026-04-17 00:56:10.465	IMAGE	f	f	f	f	\N	\N
111	shops/shop-products/product-images/87/photo-1553011290-71c039f001c0.jfif	\N	13	\N	2026-04-17 00:58:02.86	2026-04-17 00:58:02.86	IMAGE	f	f	f	f	\N	87
112	shops/shop-products/product-images/426/228024f6da43fb5bf47bef892f6a045a.jpg	\N	13	426	2026-04-17 00:58:03.61	2026-04-17 00:58:03.61	IMAGE	f	f	f	f	\N	\N
113	shops/shop-products/product-images/985/228024f6da43fb5bf47bef892f6a045a.jpg	\N	13	985	2026-04-17 00:58:03.786	2026-04-17 00:58:03.786	IMAGE	f	f	f	f	\N	\N
114	shops/shop-products/product-images/984/photo-1521572163474-6864f9cf17ab.jfif	\N	13	984	2026-04-17 00:58:05.969	2026-04-17 00:58:05.969	IMAGE	f	f	f	f	\N	\N
115	shops/shop-products/product-images/982/photo-1595211877493-41a4e5f236b3.jfif	\N	13	982	2026-04-17 00:58:06.181	2026-04-17 00:58:06.181	IMAGE	f	f	f	f	\N	\N
116	shops/shop-products/product-images/989/228024f6da43fb5bf47bef892f6a045a.jpg	\N	13	989	2026-04-17 00:58:06.534	2026-04-17 00:58:06.534	IMAGE	f	f	f	f	\N	\N
117	shops/shop-products/product-images/983/photo-1562157873-818bc0726f68.jfif	\N	13	983	2026-04-17 00:58:06.868	2026-04-17 00:58:06.868	IMAGE	f	f	f	f	\N	\N
118	shops/shop-products/product-images/986/photo-1562157873-818bc0726f68.jfif	\N	13	986	2026-04-17 00:58:06.923	2026-04-17 00:58:06.923	IMAGE	f	f	f	f	\N	\N
119	shops/shop-products/product-images/987/photo-1595211877493-41a4e5f236b3.jfif	\N	13	987	2026-04-17 00:58:07.219	2026-04-17 00:58:07.219	IMAGE	f	f	f	f	\N	\N
120	shops/shop-products/product-images/993/228024f6da43fb5bf47bef892f6a045a.jpg	\N	13	993	2026-04-17 00:58:07.546	2026-04-17 00:58:07.546	IMAGE	f	f	f	f	\N	\N
121	shops/shop-products/product-images/981/photo-1596566638409-fc1426bf6574.jfif	\N	13	981	2026-04-17 00:58:08.839	2026-04-17 00:58:08.839	IMAGE	f	f	f	f	\N	\N
122	shops/shop-products/product-images/992/photo-1521572163474-6864f9cf17ab.jfif	\N	13	992	2026-04-17 00:58:08.948	2026-04-17 00:58:08.948	IMAGE	f	f	f	f	\N	\N
123	shops/shop-products/product-images/988/photo-1521572163474-6864f9cf17ab.jfif	\N	13	988	2026-04-17 00:58:09.525	2026-04-17 00:58:09.525	IMAGE	f	f	f	f	\N	\N
124	shops/shop-products/product-images/996/photo-1521572163474-6864f9cf17ab.jfif	\N	13	996	2026-04-17 00:58:09.677	2026-04-17 00:58:09.677	IMAGE	f	f	f	f	\N	\N
125	shops/shop-products/product-images/997/228024f6da43fb5bf47bef892f6a045a.jpg	\N	13	997	2026-04-17 00:58:10.01	2026-04-17 00:58:10.01	IMAGE	f	f	f	f	\N	\N
126	shops/shop-products/product-images/991/photo-1595211877493-41a4e5f236b3.jfif	\N	13	991	2026-04-17 00:58:11.164	2026-04-17 00:58:11.164	IMAGE	f	f	f	f	\N	\N
127	shops/shop-products/product-images/990/photo-1596566638409-fc1426bf6574.jfif	\N	13	990	2026-04-17 00:58:11.234	2026-04-17 00:58:11.234	IMAGE	f	f	f	f	\N	\N
128	shops/shop-products/product-images/995/photo-1562157873-818bc0726f68.jfif	\N	13	995	2026-04-17 00:58:11.494	2026-04-17 00:58:11.494	IMAGE	f	f	f	f	\N	\N
129	shops/shop-products/product-images/994/photo-1596566638409-fc1426bf6574.jfif	\N	13	994	2026-04-17 00:58:11.54	2026-04-17 00:58:11.54	IMAGE	f	f	f	f	\N	\N
130	shops/shop-products/product-images/998/photo-1596566638409-fc1426bf6574.jfif	\N	13	998	2026-04-17 00:58:12.049	2026-04-17 00:58:12.049	IMAGE	f	f	f	f	\N	\N
131	shops/shop-products/product-images/428/photo-1562157873-818bc0726f68.jfif	\N	13	428	2026-04-17 00:58:13.097	2026-04-17 00:58:13.097	IMAGE	f	f	f	f	\N	\N
132	shops/shop-products/product-images/427/photo-1596566638409-fc1426bf6574.jfif	\N	13	427	2026-04-17 00:58:13.882	2026-04-17 00:58:13.882	IMAGE	f	f	f	f	\N	\N
133	shops/shop-products/product-images/999/photo-1562157873-818bc0726f68.jfif	\N	13	999	2026-04-17 00:58:13.954	2026-04-17 00:58:13.954	IMAGE	f	f	f	f	\N	\N
134	shops/shop-products/product-images/429/photo-1595211877493-41a4e5f236b3.jfif	\N	13	429	2026-04-17 00:58:14.13	2026-04-17 00:58:14.13	IMAGE	f	f	f	f	\N	\N
135	shops/shop-products/product-images/1000/photo-1595211877493-41a4e5f236b3.jfif	\N	13	1000	2026-04-17 00:58:14.969	2026-04-17 00:58:14.969	IMAGE	f	f	f	f	\N	\N
136	shops/shop-products/product-images/430/photo-1521572163474-6864f9cf17ab.jfif	\N	13	430	2026-04-17 00:58:15.012	2026-04-17 00:58:15.012	IMAGE	f	f	f	f	\N	\N
137	users/user-avatars/user-avatar-images/13/photo-1613852348851-df1739db8201.jfif	\N	13	\N	2026-04-17 01:17:50.414	2026-04-17 01:17:50.414	IMAGE	f	f	f	t	\N	\N
138	shops/shop-products/product-images/92/924cd82859dcdae73dc6242dc227aa35.jpg	\N	13	\N	2026-04-17 04:27:47.793	2026-04-17 04:27:47.793	IMAGE	f	f	f	f	\N	92
139	shops/shop-products/product-images/1003/08110a992a91d2b896273b8139f2bc17.jpg	\N	13	1003	2026-04-17 04:27:48.704	2026-04-17 04:27:48.704	IMAGE	f	f	f	f	\N	\N
140	shops/shop-products/product-images/1004/89ed53f440985db5727d814242e32e66.jpg	\N	13	1004	2026-04-17 04:27:48.704	2026-04-17 04:27:48.704	IMAGE	f	f	f	f	\N	\N
141	shops/shop-products/product-images/451/89ed53f440985db5727d814242e32e66.jpg	\N	13	451	2026-04-17 04:27:48.717	2026-04-17 04:27:48.717	IMAGE	f	f	f	f	\N	\N
142	shops/shop-products/product-images/1005/da22965d18c51dfea945f2d1cbe41b0b.jpg	\N	13	1005	2026-04-17 04:27:48.733	2026-04-17 04:27:48.733	IMAGE	f	f	f	f	\N	\N
143	shops/shop-products/product-images/1006/19b871f46b5c128c1e2d84ac0a2fffd8.jpg	\N	13	1006	2026-04-17 04:27:49.067	2026-04-17 04:27:49.067	IMAGE	f	f	f	f	\N	\N
144	shops/shop-products/product-images/1001/dc734e718a62fe37befa5a0ea44b8ea0.jpg	\N	13	1001	2026-04-17 04:27:49.311	2026-04-17 04:27:49.311	IMAGE	f	f	f	f	\N	\N
145	shops/shop-products/product-images/1010/dc734e718a62fe37befa5a0ea44b8ea0.jpg	\N	13	1010	2026-04-17 04:27:49.396	2026-04-17 04:27:49.396	IMAGE	f	f	f	f	\N	\N
146	shops/shop-products/product-images/1007/08110a992a91d2b896273b8139f2bc17.jpg	\N	13	1007	2026-04-17 04:27:49.44	2026-04-17 04:27:49.44	IMAGE	f	f	f	f	\N	\N
147	shops/shop-products/product-images/1008/89ed53f440985db5727d814242e32e66.jpg	\N	13	1008	2026-04-17 04:27:49.448	2026-04-17 04:27:49.448	IMAGE	f	f	f	f	\N	\N
148	shops/shop-products/product-images/1002/19b871f46b5c128c1e2d84ac0a2fffd8.jpg	\N	13	1002	2026-04-17 04:27:49.487	2026-04-17 04:27:49.487	IMAGE	f	f	f	f	\N	\N
149	shops/shop-products/product-images/1011/19b871f46b5c128c1e2d84ac0a2fffd8.jpg	\N	13	1011	2026-04-17 04:27:49.631	2026-04-17 04:27:49.631	IMAGE	f	f	f	f	\N	\N
150	shops/shop-products/product-images/1013/89ed53f440985db5727d814242e32e66.jpg	\N	13	1013	2026-04-17 04:27:49.731	2026-04-17 04:27:49.731	IMAGE	f	f	f	f	\N	\N
151	shops/shop-products/product-images/1014/dc734e718a62fe37befa5a0ea44b8ea0.jpg	\N	13	1014	2026-04-17 04:27:49.862	2026-04-17 04:27:49.862	IMAGE	f	f	f	f	\N	\N
152	shops/shop-products/product-images/1016/08110a992a91d2b896273b8139f2bc17.jpg	\N	13	1016	2026-04-17 04:27:49.921	2026-04-17 04:27:49.921	IMAGE	f	f	f	f	\N	\N
153	shops/shop-products/product-images/1015/da22965d18c51dfea945f2d1cbe41b0b.jpg	\N	13	1015	2026-04-17 04:27:49.972	2026-04-17 04:27:49.972	IMAGE	f	f	f	f	\N	\N
154	shops/shop-products/product-images/1017/89ed53f440985db5727d814242e32e66.jpg	\N	13	1017	2026-04-17 04:27:50.041	2026-04-17 04:27:50.041	IMAGE	f	f	f	f	\N	\N
155	shops/shop-products/product-images/1012/08110a992a91d2b896273b8139f2bc17.jpg	\N	13	1012	2026-04-17 04:27:50.121	2026-04-17 04:27:50.121	IMAGE	f	f	f	f	\N	\N
156	shops/shop-products/product-images/1018/dc734e718a62fe37befa5a0ea44b8ea0.jpg	\N	13	1018	2026-04-17 04:27:50.156	2026-04-17 04:27:50.156	IMAGE	f	f	f	f	\N	\N
157	shops/shop-products/product-images/1009/da22965d18c51dfea945f2d1cbe41b0b.jpg	\N	13	1009	2026-04-17 04:27:50.202	2026-04-17 04:27:50.202	IMAGE	f	f	f	f	\N	\N
158	shops/shop-products/product-images/1019/da22965d18c51dfea945f2d1cbe41b0b.jpg	\N	13	1019	2026-04-17 04:27:50.226	2026-04-17 04:27:50.226	IMAGE	f	f	f	f	\N	\N
159	shops/shop-products/product-images/1020/19b871f46b5c128c1e2d84ac0a2fffd8.jpg	\N	13	1020	2026-04-17 04:27:50.31	2026-04-17 04:27:50.31	IMAGE	f	f	f	f	\N	\N
160	shops/shop-products/product-images/452/dc734e718a62fe37befa5a0ea44b8ea0.jpg	\N	13	452	2026-04-17 04:27:50.37	2026-04-17 04:27:50.37	IMAGE	f	f	f	f	\N	\N
161	shops/shop-products/product-images/454/19b871f46b5c128c1e2d84ac0a2fffd8.jpg	\N	13	454	2026-04-17 04:27:50.528	2026-04-17 04:27:50.528	IMAGE	f	f	f	f	\N	\N
162	shops/shop-products/product-images/455/08110a992a91d2b896273b8139f2bc17.jpg	\N	13	455	2026-04-17 04:27:50.654	2026-04-17 04:27:50.654	IMAGE	f	f	f	f	\N	\N
163	shops/shop-products/product-images/453/da22965d18c51dfea945f2d1cbe41b0b.jpg	\N	13	453	2026-04-17 04:27:50.812	2026-04-17 04:27:50.812	IMAGE	f	f	f	f	\N	\N
164	shops/shop-products/product-images/93/d9c60d0b912b2b9a32f333f89b3b73d0.png	\N	13	\N	2026-04-17 04:29:01.628	2026-04-17 04:29:01.628	IMAGE	f	f	f	f	\N	93
169	shops/shop-products/product-images/1021/08110a992a91d2b896273b8139f2bc17.jpg	\N	13	1021	2026-04-17 04:29:02.46	2026-04-17 04:29:02.46	IMAGE	f	f	f	f	\N	\N
173	shops/shop-products/product-images/1032/132d928115f6229ab4e44a98622c199e.jpg	\N	13	1032	2026-04-17 04:29:02.914	2026-04-17 04:29:02.914	IMAGE	f	f	f	f	\N	\N
174	shops/shop-products/product-images/1033/268444aa1cfa0cb0f4d33aa0ca033509.jpg	\N	13	1033	2026-04-17 04:29:03.234	2026-04-17 04:29:03.234	IMAGE	f	f	f	f	\N	\N
175	shops/shop-products/product-images/1029/268444aa1cfa0cb0f4d33aa0ca033509.jpg	\N	13	1029	2026-04-17 04:29:03.273	2026-04-17 04:29:03.273	IMAGE	f	f	f	f	\N	\N
177	shops/shop-products/product-images/1036/132d928115f6229ab4e44a98622c199e.jpg	\N	13	1036	2026-04-17 04:29:03.801	2026-04-17 04:29:03.801	IMAGE	f	f	f	f	\N	\N
178	shops/shop-products/product-images/1037/268444aa1cfa0cb0f4d33aa0ca033509.jpg	\N	13	1037	2026-04-17 04:29:03.835	2026-04-17 04:29:03.835	IMAGE	f	f	f	f	\N	\N
179	shops/shop-products/product-images/1035/b7d081b41a897858d0aa8f119aa6586e.jpg	\N	13	1035	2026-04-17 04:29:03.916	2026-04-17 04:29:03.916	IMAGE	f	f	f	f	\N	\N
180	shops/shop-products/product-images/1039/b7d081b41a897858d0aa8f119aa6586e.jpg	\N	13	1039	2026-04-17 04:29:04.114	2026-04-17 04:29:04.114	IMAGE	f	f	f	f	\N	\N
181	shops/shop-products/product-images/1040/08110a992a91d2b896273b8139f2bc17.jpg	\N	13	1040	2026-04-17 04:29:04.724	2026-04-17 04:29:04.724	IMAGE	f	f	f	f	\N	\N
182	shops/shop-products/product-images/458/b7d081b41a897858d0aa8f119aa6586e.jpg	\N	13	458	2026-04-17 04:29:05.04	2026-04-17 04:29:05.04	IMAGE	f	f	f	f	\N	\N
183	shops/shop-products/product-images/459/08110a992a91d2b896273b8139f2bc17.jpg	\N	13	459	2026-04-17 04:29:05.834	2026-04-17 04:29:05.834	IMAGE	f	f	f	f	\N	\N
184	shops/shop-products/product-images/460/132d928115f6229ab4e44a98622c199e.jpg	\N	13	460	2026-04-17 04:29:06.308	2026-04-17 04:29:06.308	IMAGE	f	f	f	f	\N	\N
185	shops/shop-products/product-images/1030/benjamin-r-WdhmRPvMn7A-unsplash.jpg	\N	13	1030	2026-04-17 04:29:08.471	2026-04-17 04:29:08.471	IMAGE	f	f	f	f	\N	\N
186	shops/shop-products/product-images/1024/benjamin-r-WdhmRPvMn7A-unsplash.jpg	\N	13	1024	2026-04-17 04:29:10.811	2026-04-17 04:29:10.811	IMAGE	f	f	f	f	\N	\N
187	shops/shop-products/product-images/457/benjamin-r-WdhmRPvMn7A-unsplash.jpg	\N	13	457	2026-04-17 04:29:11.175	2026-04-17 04:29:11.175	IMAGE	f	f	f	f	\N	\N
188	shops/shop-products/product-images/1034/benjamin-r-WdhmRPvMn7A-unsplash.jpg	\N	13	1034	2026-04-17 04:29:11.238	2026-04-17 04:29:11.238	IMAGE	f	f	f	f	\N	\N
189	shops/shop-products/product-images/1038/benjamin-r-WdhmRPvMn7A-unsplash.jpg	\N	13	1038	2026-04-17 04:29:11.379	2026-04-17 04:29:11.379	IMAGE	f	f	f	f	\N	\N
165	shops/shop-products/product-images/1022/b7d081b41a897858d0aa8f119aa6586e.jpg	\N	13	1022	2026-04-17 04:29:01.979	2026-04-17 04:29:01.979	IMAGE	f	f	f	f	\N	\N
166	shops/shop-products/product-images/1023/132d928115f6229ab4e44a98622c199e.jpg	\N	13	1023	2026-04-17 04:29:02.065	2026-04-17 04:29:02.065	IMAGE	f	f	f	f	\N	\N
167	shops/shop-products/product-images/1025/268444aa1cfa0cb0f4d33aa0ca033509.jpg	\N	13	1025	2026-04-17 04:29:02.218	2026-04-17 04:29:02.218	IMAGE	f	f	f	f	\N	\N
168	shops/shop-products/product-images/1026/b7d081b41a897858d0aa8f119aa6586e.jpg	\N	13	1026	2026-04-17 04:29:02.325	2026-04-17 04:29:02.325	IMAGE	f	f	f	f	\N	\N
171	shops/shop-products/product-images/1028/132d928115f6229ab4e44a98622c199e.jpg	\N	13	1028	2026-04-17 04:29:02.614	2026-04-17 04:29:02.614	IMAGE	f	f	f	f	\N	\N
172	shops/shop-products/product-images/1031/08110a992a91d2b896273b8139f2bc17.jpg	\N	13	1031	2026-04-17 04:29:02.9	2026-04-17 04:29:02.9	IMAGE	f	f	f	f	\N	\N
176	shops/shop-products/product-images/1027/08110a992a91d2b896273b8139f2bc17.jpg	\N	13	1027	2026-04-17 04:29:03.282	2026-04-17 04:29:03.282	IMAGE	f	f	f	f	\N	\N
203	shops/shop-products/product-images/1052/b19749785a2e96d23c0d894d4defd96c.jpg	\N	13	1052	2026-04-17 04:30:03.459	2026-04-17 04:30:03.459	IMAGE	f	f	f	f	\N	\N
204	shops/shop-products/product-images/1048/b19749785a2e96d23c0d894d4defd96c.jpg	\N	13	1048	2026-04-17 04:30:03.477	2026-04-17 04:30:03.477	IMAGE	f	f	f	f	\N	\N
208	shops/shop-products/product-images/1059/08110a992a91d2b896273b8139f2bc17.jpg	\N	13	1059	2026-04-17 04:30:03.87	2026-04-17 04:30:03.87	IMAGE	f	f	f	f	\N	\N
211	shops/shop-products/product-images/463/08110a992a91d2b896273b8139f2bc17.jpg	\N	13	463	2026-04-17 04:30:04.2	2026-04-17 04:30:04.2	IMAGE	f	f	f	f	\N	\N
214	shops/shop-products/product-images/1057/8177373fad78f1dcf5187842c46bfba6.jpg	\N	13	1057	2026-04-17 04:30:04.234	2026-04-17 04:30:04.234	IMAGE	f	f	f	f	\N	\N
215	shops/shop-products/product-images/465/b19749785a2e96d23c0d894d4defd96c.jpg	\N	13	465	2026-04-17 04:30:04.581	2026-04-17 04:30:04.581	IMAGE	f	f	f	f	\N	\N
170	shops/shop-products/product-images/456/268444aa1cfa0cb0f4d33aa0ca033509.jpg	\N	13	456	2026-04-17 04:29:02.487	2026-04-17 04:29:02.487	IMAGE	f	f	f	f	\N	\N
190	shops/shop-products/product-images/94/9d1cecc6e162a20f7eb55887d69a6a9d.jpg	\N	13	\N	2026-04-17 04:30:02.041	2026-04-17 04:30:02.041	IMAGE	f	f	f	f	\N	94
191	shops/shop-products/product-images/1041/19b871f46b5c128c1e2d84ac0a2fffd8.jpg	\N	13	1041	2026-04-17 04:30:02.445	2026-04-17 04:30:02.445	IMAGE	f	f	f	f	\N	\N
192	shops/shop-products/product-images/1043/b19749785a2e96d23c0d894d4defd96c.jpg	\N	13	1043	2026-04-17 04:30:02.538	2026-04-17 04:30:02.538	IMAGE	f	f	f	f	\N	\N
193	shops/shop-products/product-images/1042/132d928115f6229ab4e44a98622c199e.jpg	\N	13	1042	2026-04-17 04:30:02.739	2026-04-17 04:30:02.739	IMAGE	f	f	f	f	\N	\N
194	shops/shop-products/product-images/1046/08110a992a91d2b896273b8139f2bc17.jpg	\N	13	1046	2026-04-17 04:30:02.741	2026-04-17 04:30:02.741	IMAGE	f	f	f	f	\N	\N
195	shops/shop-products/product-images/1047/132d928115f6229ab4e44a98622c199e.jpg	\N	13	1047	2026-04-17 04:30:02.871	2026-04-17 04:30:02.871	IMAGE	f	f	f	f	\N	\N
196	shops/shop-products/product-images/1044/8177373fad78f1dcf5187842c46bfba6.jpg	\N	13	1044	2026-04-17 04:30:02.882	2026-04-17 04:30:02.882	IMAGE	f	f	f	f	\N	\N
197	shops/shop-products/product-images/461/8177373fad78f1dcf5187842c46bfba6.jpg	\N	13	461	2026-04-17 04:30:02.992	2026-04-17 04:30:02.992	IMAGE	f	f	f	f	\N	\N
198	shops/shop-products/product-images/1045/08110a992a91d2b896273b8139f2bc17.jpg	\N	13	1045	2026-04-17 04:30:03.037	2026-04-17 04:30:03.037	IMAGE	f	f	f	f	\N	\N
199	shops/shop-products/product-images/1051/132d928115f6229ab4e44a98622c199e.jpg	\N	13	1051	2026-04-17 04:30:03.186	2026-04-17 04:30:03.186	IMAGE	f	f	f	f	\N	\N
200	shops/shop-products/product-images/1050/19b871f46b5c128c1e2d84ac0a2fffd8.jpg	\N	13	1050	2026-04-17 04:30:03.253	2026-04-17 04:30:03.253	IMAGE	f	f	f	f	\N	\N
201	shops/shop-products/product-images/1049/8177373fad78f1dcf5187842c46bfba6.jpg	\N	13	1049	2026-04-17 04:30:03.428	2026-04-17 04:30:03.428	IMAGE	f	f	f	f	\N	\N
202	shops/shop-products/product-images/1053/8177373fad78f1dcf5187842c46bfba6.jpg	\N	13	1053	2026-04-17 04:30:03.436	2026-04-17 04:30:03.436	IMAGE	f	f	f	f	\N	\N
205	shops/shop-products/product-images/1054/19b871f46b5c128c1e2d84ac0a2fffd8.jpg	\N	13	1054	2026-04-17 04:30:03.501	2026-04-17 04:30:03.501	IMAGE	f	f	f	f	\N	\N
206	shops/shop-products/product-images/1055/08110a992a91d2b896273b8139f2bc17.jpg	\N	13	1055	2026-04-17 04:30:03.566	2026-04-17 04:30:03.566	IMAGE	f	f	f	f	\N	\N
207	shops/shop-products/product-images/462/19b871f46b5c128c1e2d84ac0a2fffd8.jpg	\N	13	462	2026-04-17 04:30:03.869	2026-04-17 04:30:03.869	IMAGE	f	f	f	f	\N	\N
209	shops/shop-products/product-images/1060/132d928115f6229ab4e44a98622c199e.jpg	\N	13	1060	2026-04-17 04:30:04.114	2026-04-17 04:30:04.114	IMAGE	f	f	f	f	\N	\N
210	shops/shop-products/product-images/1058/19b871f46b5c128c1e2d84ac0a2fffd8.jpg	\N	13	1058	2026-04-17 04:30:04.14	2026-04-17 04:30:04.14	IMAGE	f	f	f	f	\N	\N
212	shops/shop-products/product-images/464/132d928115f6229ab4e44a98622c199e.jpg	\N	13	464	2026-04-17 04:30:04.205	2026-04-17 04:30:04.205	IMAGE	f	f	f	f	\N	\N
213	shops/shop-products/product-images/1056/b19749785a2e96d23c0d894d4defd96c.jpg	\N	13	1056	2026-04-17 04:30:04.233	2026-04-17 04:30:04.233	IMAGE	f	f	f	f	\N	\N
216	shops/shop-products/product-images/102/e6f2cb8d3249382afdeea032afd944a4.jpg	\N	13	\N	2026-04-17 04:31:24.672	2026-04-17 04:31:24.672	IMAGE	f	f	f	f	\N	102
217	shops/shop-products/product-images/1061/db7b282248f6b9ce2bd3d24095ad4031.jpg	\N	13	1061	2026-04-17 04:31:25.032	2026-04-17 04:31:25.032	IMAGE	f	f	f	f	\N	\N
218	shops/shop-products/product-images/1062/3e3469bf55962acdf526259a35a8e4e2.jpg	\N	13	1062	2026-04-17 04:31:25.038	2026-04-17 04:31:25.038	IMAGE	f	f	f	f	\N	\N
219	shops/shop-products/product-images/1064/228ebdd782863e73045ef7fa26d3af0a.jpg	\N	13	1064	2026-04-17 04:31:25.333	2026-04-17 04:31:25.333	IMAGE	f	f	f	f	\N	\N
220	shops/shop-products/product-images/1063/9422660cc086dad9d9baa08ec5941b8e.jpg	\N	13	1063	2026-04-17 04:31:25.585	2026-04-17 04:31:25.585	IMAGE	f	f	f	f	\N	\N
221	shops/shop-products/product-images/1066/9422660cc086dad9d9baa08ec5941b8e.jpg	\N	13	1066	2026-04-17 04:31:25.669	2026-04-17 04:31:25.669	IMAGE	f	f	f	f	\N	\N
222	shops/shop-products/product-images/1067/3e3469bf55962acdf526259a35a8e4e2.jpg	\N	13	1067	2026-04-17 04:31:25.702	2026-04-17 04:31:25.702	IMAGE	f	f	f	f	\N	\N
223	shops/shop-products/product-images/1070/db7b282248f6b9ce2bd3d24095ad4031.jpg	\N	13	1070	2026-04-17 04:31:25.91	2026-04-17 04:31:25.91	IMAGE	f	f	f	f	\N	\N
224	shops/shop-products/product-images/1068/228ebdd782863e73045ef7fa26d3af0a.jpg	\N	13	1068	2026-04-17 04:31:25.955	2026-04-17 04:31:25.955	IMAGE	f	f	f	f	\N	\N
225	shops/shop-products/product-images/1071/3e3469bf55962acdf526259a35a8e4e2.jpg	\N	13	1071	2026-04-17 04:31:25.955	2026-04-17 04:31:25.955	IMAGE	f	f	f	f	\N	\N
226	shops/shop-products/product-images/1074/db7b282248f6b9ce2bd3d24095ad4031.jpg	\N	13	1074	2026-04-17 04:31:26.387	2026-04-17 04:31:26.387	IMAGE	f	f	f	f	\N	\N
227	shops/shop-products/product-images/1065/1503313ff7961b9feb0520a114042a63.jpg	\N	13	1065	2026-04-17 04:31:26.702	2026-04-17 04:31:26.702	IMAGE	f	f	f	f	\N	\N
228	shops/shop-products/product-images/1075/9422660cc086dad9d9baa08ec5941b8e.jpg	\N	13	1075	2026-04-17 04:31:27.259	2026-04-17 04:31:27.259	IMAGE	f	f	f	f	\N	\N
229	shops/shop-products/product-images/1072/228ebdd782863e73045ef7fa26d3af0a.jpg	\N	13	1072	2026-04-17 04:31:27.342	2026-04-17 04:31:27.342	IMAGE	f	f	f	f	\N	\N
230	shops/shop-products/product-images/1069/1503313ff7961b9feb0520a114042a63.jpg	\N	13	1069	2026-04-17 04:31:27.364	2026-04-17 04:31:27.364	IMAGE	f	f	f	f	\N	\N
231	shops/shop-products/product-images/501/1503313ff7961b9feb0520a114042a63.jpg	\N	13	501	2026-04-17 04:31:27.489	2026-04-17 04:31:27.489	IMAGE	f	f	f	f	\N	\N
232	shops/shop-products/product-images/1076/228ebdd782863e73045ef7fa26d3af0a.jpg	\N	13	1076	2026-04-17 04:31:27.767	2026-04-17 04:31:27.767	IMAGE	f	f	f	f	\N	\N
233	shops/shop-products/product-images/1078/db7b282248f6b9ce2bd3d24095ad4031.jpg	\N	13	1078	2026-04-17 04:31:28.006	2026-04-17 04:31:28.006	IMAGE	f	f	f	f	\N	\N
234	shops/shop-products/product-images/1073/1503313ff7961b9feb0520a114042a63.jpg	\N	13	1073	2026-04-17 04:31:28.256	2026-04-17 04:31:28.256	IMAGE	f	f	f	f	\N	\N
235	shops/shop-products/product-images/1080/3e3469bf55962acdf526259a35a8e4e2.jpg	\N	13	1080	2026-04-17 04:31:28.306	2026-04-17 04:31:28.306	IMAGE	f	f	f	f	\N	\N
236	shops/shop-products/product-images/502/db7b282248f6b9ce2bd3d24095ad4031.jpg	\N	13	502	2026-04-17 04:31:28.639	2026-04-17 04:31:28.639	IMAGE	f	f	f	f	\N	\N
237	shops/shop-products/product-images/1077/1503313ff7961b9feb0520a114042a63.jpg	\N	13	1077	2026-04-17 04:31:28.708	2026-04-17 04:31:28.708	IMAGE	f	f	f	f	\N	\N
238	shops/shop-products/product-images/505/228ebdd782863e73045ef7fa26d3af0a.jpg	\N	13	505	2026-04-17 04:31:29.179	2026-04-17 04:31:29.179	IMAGE	f	f	f	f	\N	\N
239	shops/shop-products/product-images/1079/9422660cc086dad9d9baa08ec5941b8e.jpg	\N	13	1079	2026-04-17 04:31:29.201	2026-04-17 04:31:29.201	IMAGE	f	f	f	f	\N	\N
240	shops/shop-products/product-images/504/3e3469bf55962acdf526259a35a8e4e2.jpg	\N	13	504	2026-04-17 04:31:29.356	2026-04-17 04:31:29.356	IMAGE	f	f	f	f	\N	\N
241	shops/shop-products/product-images/503/9422660cc086dad9d9baa08ec5941b8e.jpg	\N	13	503	2026-04-17 04:31:29.405	2026-04-17 04:31:29.405	IMAGE	f	f	f	f	\N	\N
242	shops/shop-products/product-images/104/84d0c166ed07f8da8c1d4ebc521b439c.jpg	\N	13	\N	2026-04-17 04:32:10.157	2026-04-17 04:32:10.157	IMAGE	f	f	f	f	\N	104
243	shops/shop-products/product-images/1081/db7b282248f6b9ce2bd3d24095ad4031.jpg	\N	13	1081	2026-04-17 04:32:10.498	2026-04-17 04:32:10.498	IMAGE	f	f	f	f	\N	\N
244	shops/shop-products/product-images/1083/2209a1ff9fa41ad3653b8ddf797de46f.jpg	\N	13	1083	2026-04-17 04:32:11.066	2026-04-17 04:32:11.066	IMAGE	f	f	f	f	\N	\N
245	shops/shop-products/product-images/1084/9422660cc086dad9d9baa08ec5941b8e.jpg	\N	13	1084	2026-04-17 04:32:11.183	2026-04-17 04:32:11.183	IMAGE	f	f	f	f	\N	\N
246	shops/shop-products/product-images/1086/2209a1ff9fa41ad3653b8ddf797de46f.jpg	\N	13	1086	2026-04-17 04:32:11.351	2026-04-17 04:32:11.351	IMAGE	f	f	f	f	\N	\N
247	shops/shop-products/product-images/1087/db7b282248f6b9ce2bd3d24095ad4031.jpg	\N	13	1087	2026-04-17 04:32:11.384	2026-04-17 04:32:11.384	IMAGE	f	f	f	f	\N	\N
248	shops/shop-products/product-images/1082/49d8a75da4b6f5a1ebcd8a130bb2356b.jpg	\N	13	1082	2026-04-17 04:32:11.517	2026-04-17 04:32:11.517	IMAGE	f	f	f	f	\N	\N
249	shops/shop-products/product-images/1088/9422660cc086dad9d9baa08ec5941b8e.jpg	\N	13	1088	2026-04-17 04:32:12.049	2026-04-17 04:32:12.049	IMAGE	f	f	f	f	\N	\N
250	shops/shop-products/product-images/1091/db7b282248f6b9ce2bd3d24095ad4031.jpg	\N	13	1091	2026-04-17 04:32:12.205	2026-04-17 04:32:12.205	IMAGE	f	f	f	f	\N	\N
251	shops/shop-products/product-images/1090/49d8a75da4b6f5a1ebcd8a130bb2356b.jpg	\N	13	1090	2026-04-17 04:32:12.758	2026-04-17 04:32:12.758	IMAGE	f	f	f	f	\N	\N
252	shops/shop-products/product-images/1092/9422660cc086dad9d9baa08ec5941b8e.jpg	\N	13	1092	2026-04-17 04:32:12.911	2026-04-17 04:32:12.911	IMAGE	f	f	f	f	\N	\N
253	shops/shop-products/product-images/1095/2209a1ff9fa41ad3653b8ddf797de46f.jpg	\N	13	1095	2026-04-17 04:32:13.582	2026-04-17 04:32:13.582	IMAGE	f	f	f	f	\N	\N
254	shops/shop-products/product-images/1096/9422660cc086dad9d9baa08ec5941b8e.jpg	\N	13	1096	2026-04-17 04:32:14.106	2026-04-17 04:32:14.106	IMAGE	f	f	f	f	\N	\N
255	shops/shop-products/product-images/1094/49d8a75da4b6f5a1ebcd8a130bb2356b.jpg	\N	13	1094	2026-04-17 04:32:14.188	2026-04-17 04:32:14.188	IMAGE	f	f	f	f	\N	\N
256	shops/shop-products/product-images/511/1c4ca7944f13ecf8cd3adc1403945508.png	\N	13	511	2026-04-17 04:32:14.369	2026-04-17 04:32:14.369	IMAGE	f	f	f	f	\N	\N
257	shops/shop-products/product-images/1099/2209a1ff9fa41ad3653b8ddf797de46f.jpg	\N	13	1099	2026-04-17 04:32:15.927	2026-04-17 04:32:15.927	IMAGE	f	f	f	f	\N	\N
258	shops/shop-products/product-images/1097/1c4ca7944f13ecf8cd3adc1403945508.png	\N	13	1097	2026-04-17 04:32:16.527	2026-04-17 04:32:16.527	IMAGE	f	f	f	f	\N	\N
259	shops/shop-products/product-images/1100/db7b282248f6b9ce2bd3d24095ad4031.jpg	\N	13	1100	2026-04-17 04:32:16.686	2026-04-17 04:32:16.686	IMAGE	f	f	f	f	\N	\N
260	shops/shop-products/product-images/1098/49d8a75da4b6f5a1ebcd8a130bb2356b.jpg	\N	13	1098	2026-04-17 04:32:17.08	2026-04-17 04:32:17.08	IMAGE	f	f	f	f	\N	\N
261	shops/shop-products/product-images/513/2209a1ff9fa41ad3653b8ddf797de46f.jpg	\N	13	513	2026-04-17 04:32:17.139	2026-04-17 04:32:17.139	IMAGE	f	f	f	f	\N	\N
262	shops/shop-products/product-images/514/db7b282248f6b9ce2bd3d24095ad4031.jpg	\N	13	514	2026-04-17 04:32:17.41	2026-04-17 04:32:17.41	IMAGE	f	f	f	f	\N	\N
263	shops/shop-products/product-images/1093/1c4ca7944f13ecf8cd3adc1403945508.png	\N	13	1093	2026-04-17 04:32:17.92	2026-04-17 04:32:17.92	IMAGE	f	f	f	f	\N	\N
264	shops/shop-products/product-images/1089/1c4ca7944f13ecf8cd3adc1403945508.png	\N	13	1089	2026-04-17 04:32:18.197	2026-04-17 04:32:18.197	IMAGE	f	f	f	f	\N	\N
265	shops/shop-products/product-images/512/49d8a75da4b6f5a1ebcd8a130bb2356b.jpg	\N	13	512	2026-04-17 04:32:18.296	2026-04-17 04:32:18.296	IMAGE	f	f	f	f	\N	\N
266	shops/shop-products/product-images/1085/1c4ca7944f13ecf8cd3adc1403945508.png	\N	13	1085	2026-04-17 04:32:18.672	2026-04-17 04:32:18.672	IMAGE	f	f	f	f	\N	\N
267	shops/shop-products/product-images/515/9422660cc086dad9d9baa08ec5941b8e.jpg	\N	13	515	2026-04-17 04:32:18.852	2026-04-17 04:32:18.852	IMAGE	f	f	f	f	\N	\N
268	shops/shop-products/product-images/106/228ebdd782863e73045ef7fa26d3af0a.jpg	\N	13	\N	2026-04-17 04:33:32.84	2026-04-17 04:33:32.84	IMAGE	f	f	f	f	\N	106
269	shops/shop-products/product-images/1104/9eca06aa3df602946da7ab2e20f9d3fb.jpg	\N	13	1104	2026-04-17 04:33:33.742	2026-04-17 04:33:33.742	IMAGE	f	f	f	f	\N	\N
270	shops/shop-products/product-images/1101/e6f2cb8d3249382afdeea032afd944a4.jpg	\N	13	1101	2026-04-17 04:33:33.946	2026-04-17 04:33:33.946	IMAGE	f	f	f	f	\N	\N
271	shops/shop-products/product-images/1103/e94af770e531b38bb982625bee82cc50.jpg	\N	13	1103	2026-04-17 04:33:34.884	2026-04-17 04:33:34.884	IMAGE	f	f	f	f	\N	\N
272	shops/shop-products/product-images/1107/9422660cc086dad9d9baa08ec5941b8e.jpg	\N	13	1107	2026-04-17 04:33:35.015	2026-04-17 04:33:35.015	IMAGE	f	f	f	f	\N	\N
273	shops/shop-products/product-images/1108/9eca06aa3df602946da7ab2e20f9d3fb.jpg	\N	13	1108	2026-04-17 04:33:35.176	2026-04-17 04:33:35.176	IMAGE	f	f	f	f	\N	\N
274	shops/shop-products/product-images/1105/9422660cc086dad9d9baa08ec5941b8e.jpg	\N	13	1105	2026-04-17 04:33:35.297	2026-04-17 04:33:35.297	IMAGE	f	f	f	f	\N	\N
275	shops/shop-products/product-images/1110/e6f2cb8d3249382afdeea032afd944a4.jpg	\N	13	1110	2026-04-17 04:33:35.625	2026-04-17 04:33:35.625	IMAGE	f	f	f	f	\N	\N
276	shops/shop-products/product-images/521/e94af770e531b38bb982625bee82cc50.jpg	\N	13	521	2026-04-17 04:33:36.706	2026-04-17 04:33:36.706	IMAGE	f	f	f	f	\N	\N
278	shops/shop-products/product-images/1111/1c4ca7944f13ecf8cd3adc1403945508.png	\N	13	1111	2026-04-17 04:33:37.524	2026-04-17 04:33:37.524	IMAGE	f	f	f	f	\N	\N
279	shops/shop-products/product-images/1106/1c4ca7944f13ecf8cd3adc1403945508.png	\N	13	1106	2026-04-17 04:33:37.644	2026-04-17 04:33:37.644	IMAGE	f	f	f	f	\N	\N
280	shops/shop-products/product-images/1113/e6f2cb8d3249382afdeea032afd944a4.jpg	\N	13	1113	2026-04-17 04:33:37.805	2026-04-17 04:33:37.805	IMAGE	f	f	f	f	\N	\N
281	shops/shop-products/product-images/1102/1c4ca7944f13ecf8cd3adc1403945508.png	\N	13	1102	2026-04-17 04:33:38.35	2026-04-17 04:33:38.35	IMAGE	f	f	f	f	\N	\N
282	shops/shop-products/product-images/1115/9422660cc086dad9d9baa08ec5941b8e.jpg	\N	13	1115	2026-04-17 04:33:38.486	2026-04-17 04:33:38.486	IMAGE	f	f	f	f	\N	\N
283	shops/shop-products/product-images/1116/9eca06aa3df602946da7ab2e20f9d3fb.jpg	\N	13	1116	2026-04-17 04:33:38.734	2026-04-17 04:33:38.734	IMAGE	f	f	f	f	\N	\N
284	shops/shop-products/product-images/1118/e6f2cb8d3249382afdeea032afd944a4.jpg	\N	13	1118	2026-04-17 04:33:39.228	2026-04-17 04:33:39.228	IMAGE	f	f	f	f	\N	\N
277	shops/shop-products/product-images/1112/9eca06aa3df602946da7ab2e20f9d3fb.jpg	\N	13	1112	2026-04-17 04:33:36.713	2026-04-17 04:33:36.713	IMAGE	f	f	f	f	\N	\N
285	shops/shop-products/product-images/1109/e94af770e531b38bb982625bee82cc50.jpg	\N	13	1109	2026-04-17 04:33:39.241	2026-04-17 04:33:39.241	IMAGE	f	f	f	f	\N	\N
286	shops/shop-products/product-images/1117/e94af770e531b38bb982625bee82cc50.jpg	\N	13	1117	2026-04-17 04:33:39.37	2026-04-17 04:33:39.37	IMAGE	f	f	f	f	\N	\N
287	shops/shop-products/product-images/1119/9422660cc086dad9d9baa08ec5941b8e.jpg	\N	13	1119	2026-04-17 04:33:39.468	2026-04-17 04:33:39.468	IMAGE	f	f	f	f	\N	\N
288	shops/shop-products/product-images/525/9eca06aa3df602946da7ab2e20f9d3fb.jpg	\N	13	525	2026-04-17 04:33:39.783	2026-04-17 04:33:39.783	IMAGE	f	f	f	f	\N	\N
289	shops/shop-products/product-images/523/9422660cc086dad9d9baa08ec5941b8e.jpg	\N	13	523	2026-04-17 04:33:40.006	2026-04-17 04:33:40.006	IMAGE	f	f	f	f	\N	\N
290	shops/shop-products/product-images/1114/e94af770e531b38bb982625bee82cc50.jpg	\N	13	1114	2026-04-17 04:33:40.439	2026-04-17 04:33:40.439	IMAGE	f	f	f	f	\N	\N
291	shops/shop-products/product-images/524/1c4ca7944f13ecf8cd3adc1403945508.png	\N	13	524	2026-04-17 04:33:40.998	2026-04-17 04:33:40.998	IMAGE	f	f	f	f	\N	\N
292	shops/shop-products/product-images/522/e6f2cb8d3249382afdeea032afd944a4.jpg	\N	13	522	2026-04-17 04:33:41.054	2026-04-17 04:33:41.054	IMAGE	f	f	f	f	\N	\N
293	shops/shop-products/product-images/1120/1c4ca7944f13ecf8cd3adc1403945508.png	\N	13	1120	2026-04-17 04:33:42.472	2026-04-17 04:33:42.472	IMAGE	f	f	f	f	\N	\N
294	shops/shop-products/product-images/112/54eb86561d69c5359dccb94c0877a3e3.jpg	\N	13	\N	2026-04-17 04:34:44.294	2026-04-17 04:34:44.294	IMAGE	f	f	f	f	\N	112
295	shops/shop-products/product-images/1122/dbaa14b3b316c46929119ed069508d33.webp	\N	13	1122	2026-04-17 04:34:44.832	2026-04-17 04:34:44.832	IMAGE	f	f	f	f	\N	\N
296	shops/shop-products/product-images/1121/fc0843ed297f497e681c0e1db113a14b.jpg	\N	13	1121	2026-04-17 04:34:44.923	2026-04-17 04:34:44.923	IMAGE	f	f	f	f	\N	\N
297	shops/shop-products/product-images/1124/f2e158c58e21fe85075c5d23ef64746b.jpg	\N	13	1124	2026-04-17 04:34:44.927	2026-04-17 04:34:44.927	IMAGE	f	f	f	f	\N	\N
298	shops/shop-products/product-images/1127/dbaa14b3b316c46929119ed069508d33.webp	\N	13	1127	2026-04-17 04:34:45.144	2026-04-17 04:34:45.144	IMAGE	f	f	f	f	\N	\N
299	shops/shop-products/product-images/1128/f2e158c58e21fe85075c5d23ef64746b.jpg	\N	13	1128	2026-04-17 04:34:45.232	2026-04-17 04:34:45.232	IMAGE	f	f	f	f	\N	\N
300	shops/shop-products/product-images/1123/9e780d5b1c511542af1d2cc4b3f98a30.jpg	\N	13	1123	2026-04-17 04:34:45.299	2026-04-17 04:34:45.299	IMAGE	f	f	f	f	\N	\N
301	shops/shop-products/product-images/1126/9e780d5b1c511542af1d2cc4b3f98a30.jpg	\N	13	1126	2026-04-17 04:34:45.319	2026-04-17 04:34:45.319	IMAGE	f	f	f	f	\N	\N
302	shops/shop-products/product-images/551/bbfcc2dee20a2017eb415857ba453226.jpg	\N	13	551	2026-04-17 04:34:45.324	2026-04-17 04:34:45.324	IMAGE	f	f	f	f	\N	\N
303	shops/shop-products/product-images/1125/bbfcc2dee20a2017eb415857ba453226.jpg	\N	13	1125	2026-04-17 04:34:45.327	2026-04-17 04:34:45.327	IMAGE	f	f	f	f	\N	\N
304	shops/shop-products/product-images/1129/bbfcc2dee20a2017eb415857ba453226.jpg	\N	13	1129	2026-04-17 04:34:45.488	2026-04-17 04:34:45.488	IMAGE	f	f	f	f	\N	\N
305	shops/shop-products/product-images/1131/dbaa14b3b316c46929119ed069508d33.webp	\N	13	1131	2026-04-17 04:34:45.582	2026-04-17 04:34:45.582	IMAGE	f	f	f	f	\N	\N
306	shops/shop-products/product-images/1130/fc0843ed297f497e681c0e1db113a14b.jpg	\N	13	1130	2026-04-17 04:34:45.648	2026-04-17 04:34:45.648	IMAGE	f	f	f	f	\N	\N
307	shops/shop-products/product-images/1132/f2e158c58e21fe85075c5d23ef64746b.jpg	\N	13	1132	2026-04-17 04:34:45.692	2026-04-17 04:34:45.692	IMAGE	f	f	f	f	\N	\N
308	shops/shop-products/product-images/1134/fc0843ed297f497e681c0e1db113a14b.jpg	\N	13	1134	2026-04-17 04:34:45.747	2026-04-17 04:34:45.747	IMAGE	f	f	f	f	\N	\N
309	shops/shop-products/product-images/1136/f2e158c58e21fe85075c5d23ef64746b.jpg	\N	13	1136	2026-04-17 04:34:45.85	2026-04-17 04:34:45.85	IMAGE	f	f	f	f	\N	\N
310	shops/shop-products/product-images/1133/bbfcc2dee20a2017eb415857ba453226.jpg	\N	13	1133	2026-04-17 04:34:45.861	2026-04-17 04:34:45.861	IMAGE	f	f	f	f	\N	\N
311	shops/shop-products/product-images/1135/9e780d5b1c511542af1d2cc4b3f98a30.jpg	\N	13	1135	2026-04-17 04:34:45.869	2026-04-17 04:34:45.869	IMAGE	f	f	f	f	\N	\N
312	shops/shop-products/product-images/1138/fc0843ed297f497e681c0e1db113a14b.jpg	\N	13	1138	2026-04-17 04:34:46.023	2026-04-17 04:34:46.023	IMAGE	f	f	f	f	\N	\N
313	shops/shop-products/product-images/1140/dbaa14b3b316c46929119ed069508d33.webp	\N	13	1140	2026-04-17 04:34:46.109	2026-04-17 04:34:46.109	IMAGE	f	f	f	f	\N	\N
314	shops/shop-products/product-images/1137/bbfcc2dee20a2017eb415857ba453226.jpg	\N	13	1137	2026-04-17 04:34:46.163	2026-04-17 04:34:46.163	IMAGE	f	f	f	f	\N	\N
315	shops/shop-products/product-images/1139/9e780d5b1c511542af1d2cc4b3f98a30.jpg	\N	13	1139	2026-04-17 04:34:46.174	2026-04-17 04:34:46.174	IMAGE	f	f	f	f	\N	\N
316	shops/shop-products/product-images/554/dbaa14b3b316c46929119ed069508d33.webp	\N	13	554	2026-04-17 04:34:46.291	2026-04-17 04:34:46.291	IMAGE	f	f	f	f	\N	\N
317	shops/shop-products/product-images/552/fc0843ed297f497e681c0e1db113a14b.jpg	\N	13	552	2026-04-17 04:34:46.38	2026-04-17 04:34:46.38	IMAGE	f	f	f	f	\N	\N
318	shops/shop-products/product-images/555/f2e158c58e21fe85075c5d23ef64746b.jpg	\N	13	555	2026-04-17 04:34:46.421	2026-04-17 04:34:46.421	IMAGE	f	f	f	f	\N	\N
319	shops/shop-products/product-images/553/9e780d5b1c511542af1d2cc4b3f98a30.jpg	\N	13	553	2026-04-17 04:34:46.709	2026-04-17 04:34:46.709	IMAGE	f	f	f	f	\N	\N
320	shops/shop-products/product-images/113/54eb86561d69c5359dccb94c0877a3e3.jpg	\N	13	\N	2026-04-17 04:35:25.745	2026-04-17 04:35:25.745	IMAGE	f	f	f	f	\N	113
321	shops/shop-products/product-images/1143/dbaa14b3b316c46929119ed069508d33.webp	\N	13	1143	2026-04-17 04:35:26.086	2026-04-17 04:35:26.086	IMAGE	f	f	f	f	\N	\N
322	shops/shop-products/product-images/1144/8740b406f8df763fec5b8785fbbe37b3.jpg	\N	13	1144	2026-04-17 04:35:26.135	2026-04-17 04:35:26.135	IMAGE	f	f	f	f	\N	\N
323	shops/shop-products/product-images/1142/f2e158c58e21fe85075c5d23ef64746b.jpg	\N	13	1142	2026-04-17 04:35:26.138	2026-04-17 04:35:26.138	IMAGE	f	f	f	f	\N	\N
324	shops/shop-products/product-images/1146/dbaa14b3b316c46929119ed069508d33.webp	\N	13	1146	2026-04-17 04:35:26.311	2026-04-17 04:35:26.311	IMAGE	f	f	f	f	\N	\N
325	shops/shop-products/product-images/1148/8740b406f8df763fec5b8785fbbe37b3.jpg	\N	13	1148	2026-04-17 04:35:26.409	2026-04-17 04:35:26.409	IMAGE	f	f	f	f	\N	\N
326	shops/shop-products/product-images/1145/68167ad1316b8bc6d73d07a8a2ff0899.jpg	\N	13	1145	2026-04-17 04:35:26.417	2026-04-17 04:35:26.417	IMAGE	f	f	f	f	\N	\N
327	shops/shop-products/product-images/1147/f2e158c58e21fe85075c5d23ef64746b.jpg	\N	13	1147	2026-04-17 04:35:26.425	2026-04-17 04:35:26.425	IMAGE	f	f	f	f	\N	\N
328	shops/shop-products/product-images/1141/bbfcc2dee20a2017eb415857ba453226.jpg	\N	13	1141	2026-04-17 04:35:26.49	2026-04-17 04:35:26.49	IMAGE	f	f	f	f	\N	\N
329	shops/shop-products/product-images/556/68167ad1316b8bc6d73d07a8a2ff0899.jpg	\N	13	556	2026-04-17 04:35:26.533	2026-04-17 04:35:26.533	IMAGE	f	f	f	f	\N	\N
330	shops/shop-products/product-images/1151/f2e158c58e21fe85075c5d23ef64746b.jpg	\N	13	1151	2026-04-17 04:35:26.702	2026-04-17 04:35:26.702	IMAGE	f	f	f	f	\N	\N
331	shops/shop-products/product-images/1152/8740b406f8df763fec5b8785fbbe37b3.jpg	\N	13	1152	2026-04-17 04:35:26.773	2026-04-17 04:35:26.773	IMAGE	f	f	f	f	\N	\N
332	shops/shop-products/product-images/1153/68167ad1316b8bc6d73d07a8a2ff0899.jpg	\N	13	1153	2026-04-17 04:35:26.792	2026-04-17 04:35:26.792	IMAGE	f	f	f	f	\N	\N
333	shops/shop-products/product-images/1149/68167ad1316b8bc6d73d07a8a2ff0899.jpg	\N	13	1149	2026-04-17 04:35:26.846	2026-04-17 04:35:26.846	IMAGE	f	f	f	f	\N	\N
342	shops/shop-products/product-images/558/dbaa14b3b316c46929119ed069508d33.webp	\N	13	558	2026-04-17 04:35:27.34	2026-04-17 04:35:27.34	IMAGE	f	f	f	f	\N	\N
344	shops/shop-products/product-images/559/f2e158c58e21fe85075c5d23ef64746b.jpg	\N	13	559	2026-04-17 04:35:27.429	2026-04-17 04:35:27.429	IMAGE	f	f	f	f	\N	\N
345	shops/shop-products/product-images/560/8740b406f8df763fec5b8785fbbe37b3.jpg	\N	13	560	2026-04-17 04:35:27.482	2026-04-17 04:35:27.482	IMAGE	f	f	f	f	\N	\N
334	shops/shop-products/product-images/1150/bbfcc2dee20a2017eb415857ba453226.jpg	\N	13	1150	2026-04-17 04:35:26.864	2026-04-17 04:35:26.864	IMAGE	f	f	f	f	\N	\N
335	shops/shop-products/product-images/1155/dbaa14b3b316c46929119ed069508d33.webp	\N	13	1155	2026-04-17 04:35:26.964	2026-04-17 04:35:26.964	IMAGE	f	f	f	f	\N	\N
336	shops/shop-products/product-images/1154/bbfcc2dee20a2017eb415857ba453226.jpg	\N	13	1154	2026-04-17 04:35:26.987	2026-04-17 04:35:26.987	IMAGE	f	f	f	f	\N	\N
337	shops/shop-products/product-images/1156/8740b406f8df763fec5b8785fbbe37b3.jpg	\N	13	1156	2026-04-17 04:35:27.079	2026-04-17 04:35:27.079	IMAGE	f	f	f	f	\N	\N
338	shops/shop-products/product-images/1157/68167ad1316b8bc6d73d07a8a2ff0899.jpg	\N	13	1157	2026-04-17 04:35:27.136	2026-04-17 04:35:27.136	IMAGE	f	f	f	f	\N	\N
339	shops/shop-products/product-images/1159/dbaa14b3b316c46929119ed069508d33.webp	\N	13	1159	2026-04-17 04:35:27.194	2026-04-17 04:35:27.194	IMAGE	f	f	f	f	\N	\N
340	shops/shop-products/product-images/1158/bbfcc2dee20a2017eb415857ba453226.jpg	\N	13	1158	2026-04-17 04:35:27.271	2026-04-17 04:35:27.271	IMAGE	f	f	f	f	\N	\N
341	shops/shop-products/product-images/1160/f2e158c58e21fe85075c5d23ef64746b.jpg	\N	13	1160	2026-04-17 04:35:27.331	2026-04-17 04:35:27.331	IMAGE	f	f	f	f	\N	\N
343	shops/shop-products/product-images/557/bbfcc2dee20a2017eb415857ba453226.jpg	\N	13	557	2026-04-17 04:35:27.412	2026-04-17 04:35:27.412	IMAGE	f	f	f	f	\N	\N
346	shops/shop-products/product-images/114/7ad322ef03ac8d4fa11c0f202c353b25.jpg	\N	13	\N	2026-04-17 04:37:40.693	2026-04-17 04:37:40.693	IMAGE	f	f	f	f	\N	114
347	shops/shop-products/product-images/1182/a92b60d5cb2a834f7d7c69e9f6678203.jpg	\N	13	1182	2026-04-17 04:37:41.028	2026-04-17 04:37:41.028	IMAGE	f	f	f	f	\N	\N
348	shops/shop-products/product-images/1181/4c3b1cd70db13596e28c7eec1dcbc1db.jpg	\N	13	1181	2026-04-17 04:37:41.042	2026-04-17 04:37:41.042	IMAGE	f	f	f	f	\N	\N
349	shops/shop-products/product-images/1184/a92b60d5cb2a834f7d7c69e9f6678203.jpg	\N	13	1184	2026-04-17 04:37:41.105	2026-04-17 04:37:41.105	IMAGE	f	f	f	f	\N	\N
350	shops/shop-products/product-images/1186/f2e158c58e21fe85075c5d23ef64746b.jpg	\N	13	1186	2026-04-17 04:37:41.287	2026-04-17 04:37:41.287	IMAGE	f	f	f	f	\N	\N
351	shops/shop-products/product-images/1188/a92b60d5cb2a834f7d7c69e9f6678203.jpg	\N	13	1188	2026-04-17 04:37:41.354	2026-04-17 04:37:41.354	IMAGE	f	f	f	f	\N	\N
352	shops/shop-products/product-images/1183/54eb86561d69c5359dccb94c0877a3e3.jpg	\N	13	1183	2026-04-17 04:37:41.556	2026-04-17 04:37:41.556	IMAGE	f	f	f	f	\N	\N
353	shops/shop-products/product-images/1187/a92b60d5cb2a834f7d7c69e9f6678203.jpg	\N	13	1187	2026-04-17 04:37:41.558	2026-04-17 04:37:41.558	IMAGE	f	f	f	f	\N	\N
354	shops/shop-products/product-images/1190/4c3b1cd70db13596e28c7eec1dcbc1db.jpg	\N	13	1190	2026-04-17 04:37:41.609	2026-04-17 04:37:41.609	IMAGE	f	f	f	f	\N	\N
355	shops/shop-products/product-images/1185/f2e158c58e21fe85075c5d23ef64746b.jpg	\N	13	1185	2026-04-17 04:37:41.611	2026-04-17 04:37:41.611	IMAGE	f	f	f	f	\N	\N
356	shops/shop-products/product-images/1189/54eb86561d69c5359dccb94c0877a3e3.jpg	\N	13	1189	2026-04-17 04:37:41.617	2026-04-17 04:37:41.617	IMAGE	f	f	f	f	\N	\N
357	shops/shop-products/product-images/1191/a92b60d5cb2a834f7d7c69e9f6678203.jpg	\N	13	1191	2026-04-17 04:37:41.838	2026-04-17 04:37:41.838	IMAGE	f	f	f	f	\N	\N
358	shops/shop-products/product-images/1192/a92b60d5cb2a834f7d7c69e9f6678203.jpg	\N	13	1192	2026-04-17 04:37:41.839	2026-04-17 04:37:41.839	IMAGE	f	f	f	f	\N	\N
359	shops/shop-products/product-images/1195/f2e158c58e21fe85075c5d23ef64746b.jpg	\N	13	1195	2026-04-17 04:37:41.902	2026-04-17 04:37:41.902	IMAGE	f	f	f	f	\N	\N
360	shops/shop-products/product-images/561/54eb86561d69c5359dccb94c0877a3e3.jpg	\N	13	561	2026-04-17 04:37:42.113	2026-04-17 04:37:42.113	IMAGE	f	f	f	f	\N	\N
361	shops/shop-products/product-images/1196/a92b60d5cb2a834f7d7c69e9f6678203.jpg	\N	13	1196	2026-04-17 04:37:42.121	2026-04-17 04:37:42.121	IMAGE	f	f	f	f	\N	\N
362	shops/shop-products/product-images/562/4c3b1cd70db13596e28c7eec1dcbc1db.jpg	\N	13	562	2026-04-17 04:37:42.21	2026-04-17 04:37:42.21	IMAGE	f	f	f	f	\N	\N
363	shops/shop-products/product-images/1199/f2e158c58e21fe85075c5d23ef64746b.jpg	\N	13	1199	2026-04-17 04:37:42.38	2026-04-17 04:37:42.38	IMAGE	f	f	f	f	\N	\N
364	shops/shop-products/product-images/1194/4c3b1cd70db13596e28c7eec1dcbc1db.jpg	\N	13	1194	2026-04-17 04:37:42.41	2026-04-17 04:37:42.41	IMAGE	f	f	f	f	\N	\N
365	shops/shop-products/product-images/1198/4c3b1cd70db13596e28c7eec1dcbc1db.jpg	\N	13	1198	2026-04-17 04:37:42.417	2026-04-17 04:37:42.417	IMAGE	f	f	f	f	\N	\N
366	shops/shop-products/product-images/1200/a92b60d5cb2a834f7d7c69e9f6678203.jpg	\N	13	1200	2026-04-17 04:37:42.445	2026-04-17 04:37:42.445	IMAGE	f	f	f	f	\N	\N
367	shops/shop-products/product-images/1193/54eb86561d69c5359dccb94c0877a3e3.jpg	\N	13	1193	2026-04-17 04:37:42.463	2026-04-17 04:37:42.463	IMAGE	f	f	f	f	\N	\N
368	shops/shop-products/product-images/1197/54eb86561d69c5359dccb94c0877a3e3.jpg	\N	13	1197	2026-04-17 04:37:42.584	2026-04-17 04:37:42.584	IMAGE	f	f	f	f	\N	\N
369	shops/shop-products/product-images/563/f2e158c58e21fe85075c5d23ef64746b.jpg	\N	13	563	2026-04-17 04:37:42.654	2026-04-17 04:37:42.654	IMAGE	f	f	f	f	\N	\N
370	shops/shop-products/product-images/565/a92b60d5cb2a834f7d7c69e9f6678203.jpg	\N	13	565	2026-04-17 04:37:42.681	2026-04-17 04:37:42.681	IMAGE	f	f	f	f	\N	\N
371	shops/shop-products/product-images/564/a92b60d5cb2a834f7d7c69e9f6678203.jpg	\N	13	564	2026-04-17 04:37:42.7	2026-04-17 04:37:42.7	IMAGE	f	f	f	f	\N	\N
372	shops/shop-products/product-images/123/0a1061ffd74ee7507e42c98c72c1e7cf.jpg	\N	13	\N	2026-04-17 04:38:57.251	2026-04-17 04:38:57.251	IMAGE	f	f	f	f	\N	123
373	shops/shop-products/product-images/1202/c7e9625bbbbbff4aec38478eb3589ecb.jpg	\N	13	1202	2026-04-17 04:38:57.779	2026-04-17 04:38:57.779	IMAGE	f	f	f	f	\N	\N
374	shops/shop-products/product-images/1201/1ab50a46128fc308ac4f50482ee72205.jpg	\N	13	1201	2026-04-17 04:38:57.891	2026-04-17 04:38:57.891	IMAGE	f	f	f	f	\N	\N
375	shops/shop-products/product-images/1207/c7e9625bbbbbff4aec38478eb3589ecb.jpg	\N	13	1207	2026-04-17 04:38:58.263	2026-04-17 04:38:58.263	IMAGE	f	f	f	f	\N	\N
376	shops/shop-products/product-images/1204/54dd74cfab1b3085c0e36147b635c968.jpg	\N	13	1204	2026-04-17 04:38:58.304	2026-04-17 04:38:58.304	IMAGE	f	f	f	f	\N	\N
377	shops/shop-products/product-images/1205/a808438235c1f2356966149d52eefb5a.jpg	\N	13	1205	2026-04-17 04:38:58.582	2026-04-17 04:38:58.582	IMAGE	f	f	f	f	\N	\N
378	shops/shop-products/product-images/1203/557cc4b6dbf7dc7ed3a32075527eec28.jpg	\N	13	1203	2026-04-17 04:38:58.688	2026-04-17 04:38:58.688	IMAGE	f	f	f	f	\N	\N
379	shops/shop-products/product-images/1208/54dd74cfab1b3085c0e36147b635c968.jpg	\N	13	1208	2026-04-17 04:38:58.728	2026-04-17 04:38:58.728	IMAGE	f	f	f	f	\N	\N
380	shops/shop-products/product-images/1206/557cc4b6dbf7dc7ed3a32075527eec28.jpg	\N	13	1206	2026-04-17 04:38:58.813	2026-04-17 04:38:58.813	IMAGE	f	f	f	f	\N	\N
381	shops/shop-products/product-images/606/a808438235c1f2356966149d52eefb5a.jpg	\N	13	606	2026-04-17 04:38:59.056	2026-04-17 04:38:59.056	IMAGE	f	f	f	f	\N	\N
382	shops/shop-products/product-images/1212/54dd74cfab1b3085c0e36147b635c968.jpg	\N	13	1212	2026-04-17 04:38:59.104	2026-04-17 04:38:59.104	IMAGE	f	f	f	f	\N	\N
383	shops/shop-products/product-images/1211/c7e9625bbbbbff4aec38478eb3589ecb.jpg	\N	13	1211	2026-04-17 04:38:59.121	2026-04-17 04:38:59.121	IMAGE	f	f	f	f	\N	\N
384	shops/shop-products/product-images/1210/1ab50a46128fc308ac4f50482ee72205.jpg	\N	13	1210	2026-04-17 04:38:59.193	2026-04-17 04:38:59.193	IMAGE	f	f	f	f	\N	\N
385	shops/shop-products/product-images/1209/a808438235c1f2356966149d52eefb5a.jpg	\N	13	1209	2026-04-17 04:38:59.256	2026-04-17 04:38:59.256	IMAGE	f	f	f	f	\N	\N
386	shops/shop-products/product-images/1213/a808438235c1f2356966149d52eefb5a.jpg	\N	13	1213	2026-04-17 04:38:59.339	2026-04-17 04:38:59.339	IMAGE	f	f	f	f	\N	\N
387	shops/shop-products/product-images/1214/1ab50a46128fc308ac4f50482ee72205.jpg	\N	13	1214	2026-04-17 04:38:59.467	2026-04-17 04:38:59.467	IMAGE	f	f	f	f	\N	\N
388	shops/shop-products/product-images/1216/54dd74cfab1b3085c0e36147b635c968.jpg	\N	13	1216	2026-04-17 04:38:59.509	2026-04-17 04:38:59.509	IMAGE	f	f	f	f	\N	\N
389	shops/shop-products/product-images/1218/1ab50a46128fc308ac4f50482ee72205.jpg	\N	13	1218	2026-04-17 04:38:59.827	2026-04-17 04:38:59.827	IMAGE	f	f	f	f	\N	\N
391	shops/shop-products/product-images/1220/c7e9625bbbbbff4aec38478eb3589ecb.jpg	\N	13	1220	2026-04-17 04:38:59.905	2026-04-17 04:38:59.905	IMAGE	f	f	f	f	\N	\N
393	shops/shop-products/product-images/607/1ab50a46128fc308ac4f50482ee72205.jpg	\N	13	607	2026-04-17 04:39:00.127	2026-04-17 04:39:00.127	IMAGE	f	f	f	f	\N	\N
394	shops/shop-products/product-images/610/54dd74cfab1b3085c0e36147b635c968.jpg	\N	13	610	2026-04-17 04:39:00.267	2026-04-17 04:39:00.267	IMAGE	f	f	f	f	\N	\N
395	shops/shop-products/product-images/608/557cc4b6dbf7dc7ed3a32075527eec28.jpg	\N	13	608	2026-04-17 04:39:00.371	2026-04-17 04:39:00.371	IMAGE	f	f	f	f	\N	\N
396	shops/shop-products/product-images/609/c7e9625bbbbbff4aec38478eb3589ecb.jpg	\N	13	609	2026-04-17 04:39:00.679	2026-04-17 04:39:00.679	IMAGE	f	f	f	f	\N	\N
397	shops/shop-products/product-images/1217/a808438235c1f2356966149d52eefb5a.jpg	\N	13	1217	2026-04-17 04:39:01.753	2026-04-17 04:39:01.753	IMAGE	f	f	f	f	\N	\N
390	shops/shop-products/product-images/1219/557cc4b6dbf7dc7ed3a32075527eec28.jpg	\N	13	1219	2026-04-17 04:38:59.845	2026-04-17 04:38:59.845	IMAGE	f	f	f	f	\N	\N
392	shops/shop-products/product-images/1215/557cc4b6dbf7dc7ed3a32075527eec28.jpg	\N	13	1215	2026-04-17 04:38:59.918	2026-04-17 04:38:59.918	IMAGE	f	f	f	f	\N	\N
398	shops/shop-products/product-images/126/96c7d19331a0ee10c31736c8c261dc39.jpg	\N	13	\N	2026-04-17 04:40:31.411	2026-04-17 04:40:31.411	IMAGE	f	f	f	f	\N	126
399	shops/shop-products/product-images/1224/0a1061ffd74ee7507e42c98c72c1e7cf.jpg	\N	13	1224	2026-04-17 04:40:31.807	2026-04-17 04:40:31.807	IMAGE	f	f	f	f	\N	\N
400	shops/shop-products/product-images/1221/2251cdf8bd4bc5f8bd47ce741f5036bf.jpg	\N	13	1221	2026-04-17 04:40:32.409	2026-04-17 04:40:32.409	IMAGE	f	f	f	f	\N	\N
401	shops/shop-products/product-images/1222/c7e9625bbbbbff4aec38478eb3589ecb.jpg	\N	13	1222	2026-04-17 04:40:32.48	2026-04-17 04:40:32.48	IMAGE	f	f	f	f	\N	\N
402	shops/shop-products/product-images/1226/34f6cfb00eb840c81f83e4108fb7a69b.jpg	\N	13	1226	2026-04-17 04:40:32.69	2026-04-17 04:40:32.69	IMAGE	f	f	f	f	\N	\N
403	shops/shop-products/product-images/1227/c7e9625bbbbbff4aec38478eb3589ecb.jpg	\N	13	1227	2026-04-17 04:40:32.768	2026-04-17 04:40:32.768	IMAGE	f	f	f	f	\N	\N
404	shops/shop-products/product-images/1228/0a1061ffd74ee7507e42c98c72c1e7cf.jpg	\N	13	1228	2026-04-17 04:40:32.776	2026-04-17 04:40:32.776	IMAGE	f	f	f	f	\N	\N
405	shops/shop-products/product-images/1223/34f6cfb00eb840c81f83e4108fb7a69b.jpg	\N	13	1223	2026-04-17 04:40:32.888	2026-04-17 04:40:32.888	IMAGE	f	f	f	f	\N	\N
406	shops/shop-products/product-images/1225/b585c3a2a4bdd281c713542ddb0b5883.jpg	\N	13	1225	2026-04-17 04:40:33.258	2026-04-17 04:40:33.258	IMAGE	f	f	f	f	\N	\N
407	shops/shop-products/product-images/1232/0a1061ffd74ee7507e42c98c72c1e7cf.jpg	\N	13	1232	2026-04-17 04:40:33.573	2026-04-17 04:40:33.573	IMAGE	f	f	f	f	\N	\N
408	shops/shop-products/product-images/1231/c7e9625bbbbbff4aec38478eb3589ecb.jpg	\N	13	1231	2026-04-17 04:40:33.657	2026-04-17 04:40:33.657	IMAGE	f	f	f	f	\N	\N
409	shops/shop-products/product-images/1230/2251cdf8bd4bc5f8bd47ce741f5036bf.jpg	\N	13	1230	2026-04-17 04:40:33.68	2026-04-17 04:40:33.68	IMAGE	f	f	f	f	\N	\N
410	shops/shop-products/product-images/1229/b585c3a2a4bdd281c713542ddb0b5883.jpg	\N	13	1229	2026-04-17 04:40:34.016	2026-04-17 04:40:34.016	IMAGE	f	f	f	f	\N	\N
411	shops/shop-products/product-images/621/b585c3a2a4bdd281c713542ddb0b5883.jpg	\N	13	621	2026-04-17 04:40:34.022	2026-04-17 04:40:34.022	IMAGE	f	f	f	f	\N	\N
412	shops/shop-products/product-images/1234/2251cdf8bd4bc5f8bd47ce741f5036bf.jpg	\N	13	1234	2026-04-17 04:40:34.023	2026-04-17 04:40:34.023	IMAGE	f	f	f	f	\N	\N
413	shops/shop-products/product-images/1235/34f6cfb00eb840c81f83e4108fb7a69b.jpg	\N	13	1235	2026-04-17 04:40:34.175	2026-04-17 04:40:34.175	IMAGE	f	f	f	f	\N	\N
414	shops/shop-products/product-images/1236/0a1061ffd74ee7507e42c98c72c1e7cf.jpg	\N	13	1236	2026-04-17 04:40:34.259	2026-04-17 04:40:34.259	IMAGE	f	f	f	f	\N	\N
415	shops/shop-products/product-images/1238/2251cdf8bd4bc5f8bd47ce741f5036bf.jpg	\N	13	1238	2026-04-17 04:40:34.499	2026-04-17 04:40:34.499	IMAGE	f	f	f	f	\N	\N
416	shops/shop-products/product-images/622/2251cdf8bd4bc5f8bd47ce741f5036bf.jpg	\N	13	622	2026-04-17 04:40:34.737	2026-04-17 04:40:34.737	IMAGE	f	f	f	f	\N	\N
417	shops/shop-products/product-images/1240/c7e9625bbbbbff4aec38478eb3589ecb.jpg	\N	13	1240	2026-04-17 04:40:35.02	2026-04-17 04:40:35.02	IMAGE	f	f	f	f	\N	\N
418	shops/shop-products/product-images/624/c7e9625bbbbbff4aec38478eb3589ecb.jpg	\N	13	624	2026-04-17 04:40:35.049	2026-04-17 04:40:35.049	IMAGE	f	f	f	f	\N	\N
419	shops/shop-products/product-images/1233/b585c3a2a4bdd281c713542ddb0b5883.jpg	\N	13	1233	2026-04-17 04:40:35.073	2026-04-17 04:40:35.073	IMAGE	f	f	f	f	\N	\N
420	shops/shop-products/product-images/625/0a1061ffd74ee7507e42c98c72c1e7cf.jpg	\N	13	625	2026-04-17 04:40:35.269	2026-04-17 04:40:35.269	IMAGE	f	f	f	f	\N	\N
421	shops/shop-products/product-images/623/34f6cfb00eb840c81f83e4108fb7a69b.jpg	\N	13	623	2026-04-17 04:40:35.284	2026-04-17 04:40:35.284	IMAGE	f	f	f	f	\N	\N
422	shops/shop-products/product-images/1239/34f6cfb00eb840c81f83e4108fb7a69b.jpg	\N	13	1239	2026-04-17 04:40:35.452	2026-04-17 04:40:35.452	IMAGE	f	f	f	f	\N	\N
423	shops/shop-products/product-images/1237/b585c3a2a4bdd281c713542ddb0b5883.jpg	\N	13	1237	2026-04-17 04:40:35.781	2026-04-17 04:40:35.781	IMAGE	f	f	f	f	\N	\N
424	shops/shop-products/product-images/128/3ecd469023ff048bff99045b425319a5.jpg	\N	13	\N	2026-04-17 04:41:45.578	2026-04-17 04:41:45.578	IMAGE	f	f	f	f	\N	128
425	shops/shop-products/product-images/1241/776f5db81803121042f5f0f0e1c9fa95.jpg	\N	13	1241	2026-04-17 04:41:46.417	2026-04-17 04:41:46.417	IMAGE	f	f	f	f	\N	\N
426	shops/shop-products/product-images/1242/54dd74cfab1b3085c0e36147b635c968.jpg	\N	13	1242	2026-04-17 04:41:46.456	2026-04-17 04:41:46.456	IMAGE	f	f	f	f	\N	\N
427	shops/shop-products/product-images/1243/96b612383cca3d02cc4b504b0eab4cca.jpg	\N	13	1243	2026-04-17 04:41:46.714	2026-04-17 04:41:46.714	IMAGE	f	f	f	f	\N	\N
428	shops/shop-products/product-images/631/34f6cfb00eb840c81f83e4108fb7a69b.jpg	\N	13	631	2026-04-17 04:41:46.888	2026-04-17 04:41:46.888	IMAGE	f	f	f	f	\N	\N
429	shops/shop-products/product-images/1247/776f5db81803121042f5f0f0e1c9fa95.jpg	\N	13	1247	2026-04-17 04:41:47.132	2026-04-17 04:41:47.132	IMAGE	f	f	f	f	\N	\N
430	shops/shop-products/product-images/1246/96b612383cca3d02cc4b504b0eab4cca.jpg	\N	13	1246	2026-04-17 04:41:47.278	2026-04-17 04:41:47.278	IMAGE	f	f	f	f	\N	\N
431	shops/shop-products/product-images/1250/54dd74cfab1b3085c0e36147b635c968.jpg	\N	13	1250	2026-04-17 04:41:47.555	2026-04-17 04:41:47.555	IMAGE	f	f	f	f	\N	\N
432	shops/shop-products/product-images/1245/34f6cfb00eb840c81f83e4108fb7a69b.jpg	\N	13	1245	2026-04-17 04:41:47.594	2026-04-17 04:41:47.594	IMAGE	f	f	f	f	\N	\N
433	shops/shop-products/product-images/1249/34f6cfb00eb840c81f83e4108fb7a69b.jpg	\N	13	1249	2026-04-17 04:41:47.693	2026-04-17 04:41:47.693	IMAGE	f	f	f	f	\N	\N
434	shops/shop-products/product-images/1254/54dd74cfab1b3085c0e36147b635c968.jpg	\N	13	1254	2026-04-17 04:41:48.093	2026-04-17 04:41:48.093	IMAGE	f	f	f	f	\N	\N
435	shops/shop-products/product-images/1248/34f6cfb00eb840c81f83e4108fb7a69b.jpg	\N	13	1248	2026-04-17 04:41:48.201	2026-04-17 04:41:48.201	IMAGE	f	f	f	f	\N	\N
436	shops/shop-products/product-images/1251/776f5db81803121042f5f0f0e1c9fa95.jpg	\N	13	1251	2026-04-17 04:41:48.303	2026-04-17 04:41:48.303	IMAGE	f	f	f	f	\N	\N
437	shops/shop-products/product-images/1252/34f6cfb00eb840c81f83e4108fb7a69b.jpg	\N	13	1252	2026-04-17 04:41:48.377	2026-04-17 04:41:48.377	IMAGE	f	f	f	f	\N	\N
438	shops/shop-products/product-images/1255/96b612383cca3d02cc4b504b0eab4cca.jpg	\N	13	1255	2026-04-17 04:41:48.488	2026-04-17 04:41:48.488	IMAGE	f	f	f	f	\N	\N
439	shops/shop-products/product-images/1256/34f6cfb00eb840c81f83e4108fb7a69b.jpg	\N	13	1256	2026-04-17 04:41:48.69	2026-04-17 04:41:48.69	IMAGE	f	f	f	f	\N	\N
440	shops/shop-products/product-images/1258/54dd74cfab1b3085c0e36147b635c968.jpg	\N	13	1258	2026-04-17 04:41:48.885	2026-04-17 04:41:48.885	IMAGE	f	f	f	f	\N	\N
441	shops/shop-products/product-images/1244/34f6cfb00eb840c81f83e4108fb7a69b.jpg	\N	13	1244	2026-04-17 04:41:48.929	2026-04-17 04:41:48.929	IMAGE	f	f	f	f	\N	\N
442	shops/shop-products/product-images/1259/96b612383cca3d02cc4b504b0eab4cca.jpg	\N	13	1259	2026-04-17 04:41:49.052	2026-04-17 04:41:49.052	IMAGE	f	f	f	f	\N	\N
443	shops/shop-products/product-images/632/54dd74cfab1b3085c0e36147b635c968.jpg	\N	13	632	2026-04-17 04:41:49.053	2026-04-17 04:41:49.053	IMAGE	f	f	f	f	\N	\N
444	shops/shop-products/product-images/1253/34f6cfb00eb840c81f83e4108fb7a69b.jpg	\N	13	1253	2026-04-17 04:41:49.065	2026-04-17 04:41:49.065	IMAGE	f	f	f	f	\N	\N
445	shops/shop-products/product-images/633/96b612383cca3d02cc4b504b0eab4cca.jpg	\N	13	633	2026-04-17 04:41:49.296	2026-04-17 04:41:49.296	IMAGE	f	f	f	f	\N	\N
446	shops/shop-products/product-images/1257/34f6cfb00eb840c81f83e4108fb7a69b.jpg	\N	13	1257	2026-04-17 04:41:49.759	2026-04-17 04:41:49.759	IMAGE	f	f	f	f	\N	\N
447	shops/shop-products/product-images/635/34f6cfb00eb840c81f83e4108fb7a69b.jpg	\N	13	635	2026-04-17 04:41:50.318	2026-04-17 04:41:50.318	IMAGE	f	f	f	f	\N	\N
448	shops/shop-products/product-images/634/776f5db81803121042f5f0f0e1c9fa95.jpg	\N	13	634	2026-04-17 04:41:50.858	2026-04-17 04:41:50.858	IMAGE	f	f	f	f	\N	\N
449	shops/shop-products/product-images/1260/776f5db81803121042f5f0f0e1c9fa95.jpg	\N	13	1260	2026-04-17 04:41:50.992	2026-04-17 04:41:50.992	IMAGE	f	f	f	f	\N	\N
450	shops/shop-products/product-images/132/2e3e6522e6625c2822ff35b798bd2d04.png	\N	13	\N	2026-04-17 04:44:39.012	2026-04-17 04:44:39.012	IMAGE	f	f	f	f	\N	132
456	shops/shop-products/product-images/1268/6d93a0eec9dcc35a170ae9c714e84e45.jpg	\N	13	1268	2026-04-17 04:44:40.534	2026-04-17 04:44:40.534	IMAGE	f	f	f	f	\N	\N
457	shops/shop-products/product-images/1267/080e14b5a5f81cb165628c82d479a660.jpg	\N	13	1267	2026-04-17 04:44:40.66	2026-04-17 04:44:40.66	IMAGE	f	f	f	f	\N	\N
458	shops/shop-products/product-images/1270/0bb31a650d7830d5bb4612cb4af4d2c0.jpg	\N	13	1270	2026-04-17 04:44:41.428	2026-04-17 04:44:41.428	IMAGE	f	f	f	f	\N	\N
459	shops/shop-products/product-images/1272/6d93a0eec9dcc35a170ae9c714e84e45.jpg	\N	13	1272	2026-04-17 04:44:41.592	2026-04-17 04:44:41.592	IMAGE	f	f	f	f	\N	\N
460	shops/shop-products/product-images/1274/0bb31a650d7830d5bb4612cb4af4d2c0.jpg	\N	13	1274	2026-04-17 04:44:42.561	2026-04-17 04:44:42.561	IMAGE	f	f	f	f	\N	\N
461	shops/shop-products/product-images/1271/080e14b5a5f81cb165628c82d479a660.jpg	\N	13	1271	2026-04-17 04:44:42.656	2026-04-17 04:44:42.656	IMAGE	f	f	f	f	\N	\N
462	shops/shop-products/product-images/1275/aec04bf0f8785242a28cf688aa6e7e8e.jpg	\N	13	1275	2026-04-17 04:44:42.961	2026-04-17 04:44:42.961	IMAGE	f	f	f	f	\N	\N
463	shops/shop-products/product-images/1264/9c496cac8aef148e7dd1a8e149092118.png	\N	13	1264	2026-04-17 04:44:43.413	2026-04-17 04:44:43.413	IMAGE	f	f	f	f	\N	\N
464	shops/shop-products/product-images/1276/6d93a0eec9dcc35a170ae9c714e84e45.jpg	\N	13	1276	2026-04-17 04:44:43.827	2026-04-17 04:44:43.827	IMAGE	f	f	f	f	\N	\N
465	shops/shop-products/product-images/1278/0bb31a650d7830d5bb4612cb4af4d2c0.jpg	\N	13	1278	2026-04-17 04:44:44.166	2026-04-17 04:44:44.166	IMAGE	f	f	f	f	\N	\N
466	shops/shop-products/product-images/1279/aec04bf0f8785242a28cf688aa6e7e8e.jpg	\N	13	1279	2026-04-17 04:44:44.369	2026-04-17 04:44:44.369	IMAGE	f	f	f	f	\N	\N
467	shops/shop-products/product-images/651/9c496cac8aef148e7dd1a8e149092118.png	\N	13	651	2026-04-17 04:44:44.648	2026-04-17 04:44:44.648	IMAGE	f	f	f	f	\N	\N
469	shops/shop-products/product-images/1280/080e14b5a5f81cb165628c82d479a660.jpg	\N	13	1280	2026-04-17 04:44:44.952	2026-04-17 04:44:44.952	IMAGE	f	f	f	f	\N	\N
470	shops/shop-products/product-images/653/aec04bf0f8785242a28cf688aa6e7e8e.jpg	\N	13	653	2026-04-17 04:44:45.045	2026-04-17 04:44:45.045	IMAGE	f	f	f	f	\N	\N
471	shops/shop-products/product-images/654/080e14b5a5f81cb165628c82d479a660.jpg	\N	13	654	2026-04-17 04:44:45.348	2026-04-17 04:44:45.348	IMAGE	f	f	f	f	\N	\N
472	shops/shop-products/product-images/655/6d93a0eec9dcc35a170ae9c714e84e45.jpg	\N	13	655	2026-04-17 04:44:45.446	2026-04-17 04:44:45.446	IMAGE	f	f	f	f	\N	\N
473	shops/shop-products/product-images/1273/9c496cac8aef148e7dd1a8e149092118.png	\N	13	1273	2026-04-17 04:44:45.939	2026-04-17 04:44:45.939	IMAGE	f	f	f	f	\N	\N
474	shops/shop-products/product-images/1277/9c496cac8aef148e7dd1a8e149092118.png	\N	13	1277	2026-04-17 04:44:46.165	2026-04-17 04:44:46.165	IMAGE	f	f	f	f	\N	\N
475	shops/shop-products/product-images/1269/9c496cac8aef148e7dd1a8e149092118.png	\N	13	1269	2026-04-17 04:44:46.299	2026-04-17 04:44:46.299	IMAGE	f	f	f	f	\N	\N
451	shops/shop-products/product-images/1261/0bb31a650d7830d5bb4612cb4af4d2c0.jpg	\N	13	1261	2026-04-17 04:44:39.61	2026-04-17 04:44:39.61	IMAGE	f	f	f	f	\N	\N
452	shops/shop-products/product-images/1263/6d93a0eec9dcc35a170ae9c714e84e45.jpg	\N	13	1263	2026-04-17 04:44:40.003	2026-04-17 04:44:40.003	IMAGE	f	f	f	f	\N	\N
453	shops/shop-products/product-images/1265/aec04bf0f8785242a28cf688aa6e7e8e.jpg	\N	13	1265	2026-04-17 04:44:40.229	2026-04-17 04:44:40.229	IMAGE	f	f	f	f	\N	\N
454	shops/shop-products/product-images/1262/080e14b5a5f81cb165628c82d479a660.jpg	\N	13	1262	2026-04-17 04:44:40.435	2026-04-17 04:44:40.435	IMAGE	f	f	f	f	\N	\N
455	shops/shop-products/product-images/1266/aec04bf0f8785242a28cf688aa6e7e8e.jpg	\N	13	1266	2026-04-17 04:44:40.53	2026-04-17 04:44:40.53	IMAGE	f	f	f	f	\N	\N
468	shops/shop-products/product-images/652/0bb31a650d7830d5bb4612cb4af4d2c0.jpg	\N	13	652	2026-04-17 04:44:44.654	2026-04-17 04:44:44.654	IMAGE	f	f	f	f	\N	\N
476	shops/shop-products/product-images/136/aec04bf0f8785242a28cf688aa6e7e8e.jpg	\N	13	\N	2026-04-17 04:45:38.583	2026-04-17 04:45:38.583	IMAGE	f	f	f	f	\N	136
477	shops/shop-products/product-images/1283/080e14b5a5f81cb165628c82d479a660.jpg	\N	13	1283	2026-04-17 04:45:39.181	2026-04-17 04:45:39.181	IMAGE	f	f	f	f	\N	\N
478	shops/shop-products/product-images/671/31f7be517e3be1e3c7f1a8a227fe46f2.jpg	\N	13	671	2026-04-17 04:45:39.493	2026-04-17 04:45:39.493	IMAGE	f	f	f	f	\N	\N
479	shops/shop-products/product-images/1284/56a2516a339a086dffee401f5b844ae4.jpg	\N	13	1284	2026-04-17 04:45:39.83	2026-04-17 04:45:39.83	IMAGE	f	f	f	f	\N	\N
480	shops/shop-products/product-images/1281/42cfde60b91cd6d1b21a2eef0f8ade07.jpg	\N	13	1281	2026-04-17 04:45:40.011	2026-04-17 04:45:40.011	IMAGE	f	f	f	f	\N	\N
481	shops/shop-products/product-images/1286/080e14b5a5f81cb165628c82d479a660.jpg	\N	13	1286	2026-04-17 04:45:40.336	2026-04-17 04:45:40.336	IMAGE	f	f	f	f	\N	\N
482	shops/shop-products/product-images/1289/31f7be517e3be1e3c7f1a8a227fe46f2.jpg	\N	13	1289	2026-04-17 04:45:40.52	2026-04-17 04:45:40.52	IMAGE	f	f	f	f	\N	\N
483	shops/shop-products/product-images/1285/31f7be517e3be1e3c7f1a8a227fe46f2.jpg	\N	13	1285	2026-04-17 04:45:40.798	2026-04-17 04:45:40.798	IMAGE	f	f	f	f	\N	\N
484	shops/shop-products/product-images/1292/56a2516a339a086dffee401f5b844ae4.jpg	\N	13	1292	2026-04-17 04:45:41.586	2026-04-17 04:45:41.586	IMAGE	f	f	f	f	\N	\N
485	shops/shop-products/product-images/1287/2e3e6522e6625c2822ff35b798bd2d04.png	\N	13	1287	2026-04-17 04:45:41.656	2026-04-17 04:45:41.656	IMAGE	f	f	f	f	\N	\N
486	shops/shop-products/product-images/1288/56a2516a339a086dffee401f5b844ae4.jpg	\N	13	1288	2026-04-17 04:45:41.807	2026-04-17 04:45:41.807	IMAGE	f	f	f	f	\N	\N
487	shops/shop-products/product-images/1294/42cfde60b91cd6d1b21a2eef0f8ade07.jpg	\N	13	1294	2026-04-17 04:45:42.161	2026-04-17 04:45:42.161	IMAGE	f	f	f	f	\N	\N
488	shops/shop-products/product-images/1295/080e14b5a5f81cb165628c82d479a660.jpg	\N	13	1295	2026-04-17 04:45:42.395	2026-04-17 04:45:42.395	IMAGE	f	f	f	f	\N	\N
489	shops/shop-products/product-images/1290/42cfde60b91cd6d1b21a2eef0f8ade07.jpg	\N	13	1290	2026-04-17 04:45:42.445	2026-04-17 04:45:42.445	IMAGE	f	f	f	f	\N	\N
490	shops/shop-products/product-images/1293/31f7be517e3be1e3c7f1a8a227fe46f2.jpg	\N	13	1293	2026-04-17 04:45:42.667	2026-04-17 04:45:42.667	IMAGE	f	f	f	f	\N	\N
491	shops/shop-products/product-images/1299/080e14b5a5f81cb165628c82d479a660.jpg	\N	13	1299	2026-04-17 04:45:43.198	2026-04-17 04:45:43.198	IMAGE	f	f	f	f	\N	\N
492	shops/shop-products/product-images/1297/31f7be517e3be1e3c7f1a8a227fe46f2.jpg	\N	13	1297	2026-04-17 04:45:43.281	2026-04-17 04:45:43.281	IMAGE	f	f	f	f	\N	\N
493	shops/shop-products/product-images/1298/42cfde60b91cd6d1b21a2eef0f8ade07.jpg	\N	13	1298	2026-04-17 04:45:43.347	2026-04-17 04:45:43.347	IMAGE	f	f	f	f	\N	\N
494	shops/shop-products/product-images/1296/56a2516a339a086dffee401f5b844ae4.jpg	\N	13	1296	2026-04-17 04:45:43.348	2026-04-17 04:45:43.348	IMAGE	f	f	f	f	\N	\N
495	shops/shop-products/product-images/1291/2e3e6522e6625c2822ff35b798bd2d04.png	\N	13	1291	2026-04-17 04:45:43.382	2026-04-17 04:45:43.382	IMAGE	f	f	f	f	\N	\N
496	shops/shop-products/product-images/673/080e14b5a5f81cb165628c82d479a660.jpg	\N	13	673	2026-04-17 04:45:44.091	2026-04-17 04:45:44.091	IMAGE	f	f	f	f	\N	\N
497	shops/shop-products/product-images/672/42cfde60b91cd6d1b21a2eef0f8ade07.jpg	\N	13	672	2026-04-17 04:45:44.148	2026-04-17 04:45:44.148	IMAGE	f	f	f	f	\N	\N
498	shops/shop-products/product-images/675/56a2516a339a086dffee401f5b844ae4.jpg	\N	13	675	2026-04-17 04:45:44.62	2026-04-17 04:45:44.62	IMAGE	f	f	f	f	\N	\N
499	shops/shop-products/product-images/674/2e3e6522e6625c2822ff35b798bd2d04.png	\N	13	674	2026-04-17 04:45:45.503	2026-04-17 04:45:45.503	IMAGE	f	f	f	f	\N	\N
500	shops/shop-products/product-images/1300/2e3e6522e6625c2822ff35b798bd2d04.png	\N	13	1300	2026-04-17 04:45:45.716	2026-04-17 04:45:45.716	IMAGE	f	f	f	f	\N	\N
501	shops/shop-products/product-images/1282/2e3e6522e6625c2822ff35b798bd2d04.png	\N	13	1282	2026-04-17 04:45:46.143	2026-04-17 04:45:46.143	IMAGE	f	f	f	f	\N	\N
502	shops/shop-products/product-images/142/4b7af976fcb39c8470cfd5868ae1217e.jpg	\N	13	\N	2026-04-17 04:47:28.692	2026-04-17 04:47:28.692	IMAGE	f	f	f	f	\N	142
503	shops/shop-products/product-images/1304/5beedaf97c6d35790c8b39b8490724af.jpg	\N	13	1304	2026-04-17 04:47:29.92	2026-04-17 04:47:29.92	IMAGE	f	f	f	f	\N	\N
504	shops/shop-products/product-images/1303/0db6d3880777fc6b6b5553f5ccb34f6c.jpg	\N	13	1303	2026-04-17 04:47:30.18	2026-04-17 04:47:30.18	IMAGE	f	f	f	f	\N	\N
505	shops/shop-products/product-images/1306/0db6d3880777fc6b6b5553f5ccb34f6c.jpg	\N	13	1306	2026-04-17 04:47:30.325	2026-04-17 04:47:30.325	IMAGE	f	f	f	f	\N	\N
506	shops/shop-products/product-images/1302/f56dee085e970c8286c2444a66b1f274.png	\N	13	1302	2026-04-17 04:47:31.075	2026-04-17 04:47:31.075	IMAGE	f	f	f	f	\N	\N
507	shops/shop-products/product-images/1301/bd2af174fbc4796e774b89c06223bfc4.png	\N	13	1301	2026-04-17 04:47:31.091	2026-04-17 04:47:31.091	IMAGE	f	f	f	f	\N	\N
508	shops/shop-products/product-images/1307/f56dee085e970c8286c2444a66b1f274.png	\N	13	1307	2026-04-17 04:47:31.352	2026-04-17 04:47:31.352	IMAGE	f	f	f	f	\N	\N
509	shops/shop-products/product-images/1308/5beedaf97c6d35790c8b39b8490724af.jpg	\N	13	1308	2026-04-17 04:47:31.673	2026-04-17 04:47:31.673	IMAGE	f	f	f	f	\N	\N
510	shops/shop-products/product-images/1305/6c7a7f723f3d0196775d7ce184b43788.jpg	\N	13	1305	2026-04-17 04:47:32.277	2026-04-17 04:47:32.277	IMAGE	f	f	f	f	\N	\N
511	shops/shop-products/product-images/1312/5beedaf97c6d35790c8b39b8490724af.jpg	\N	13	1312	2026-04-17 04:47:32.391	2026-04-17 04:47:32.391	IMAGE	f	f	f	f	\N	\N
512	shops/shop-products/product-images/1311/f56dee085e970c8286c2444a66b1f274.png	\N	13	1311	2026-04-17 04:47:32.63	2026-04-17 04:47:32.63	IMAGE	f	f	f	f	\N	\N
513	shops/shop-products/product-images/1309/6c7a7f723f3d0196775d7ce184b43788.jpg	\N	13	1309	2026-04-17 04:47:32.77	2026-04-17 04:47:32.77	IMAGE	f	f	f	f	\N	\N
514	shops/shop-products/product-images/1310/bd2af174fbc4796e774b89c06223bfc4.png	\N	13	1310	2026-04-17 04:47:33.246	2026-04-17 04:47:33.246	IMAGE	f	f	f	f	\N	\N
515	shops/shop-products/product-images/1316/5beedaf97c6d35790c8b39b8490724af.jpg	\N	13	1316	2026-04-17 04:47:33.313	2026-04-17 04:47:33.313	IMAGE	f	f	f	f	\N	\N
516	shops/shop-products/product-images/1315/0db6d3880777fc6b6b5553f5ccb34f6c.jpg	\N	13	1315	2026-04-17 04:47:33.444	2026-04-17 04:47:33.444	IMAGE	f	f	f	f	\N	\N
517	shops/shop-products/product-images/701/6c7a7f723f3d0196775d7ce184b43788.jpg	\N	13	701	2026-04-17 04:47:33.445	2026-04-17 04:47:33.445	IMAGE	f	f	f	f	\N	\N
518	shops/shop-products/product-images/1319/0db6d3880777fc6b6b5553f5ccb34f6c.jpg	\N	13	1319	2026-04-17 04:47:33.842	2026-04-17 04:47:33.842	IMAGE	f	f	f	f	\N	\N
519	shops/shop-products/product-images/1313/6c7a7f723f3d0196775d7ce184b43788.jpg	\N	13	1313	2026-04-17 04:47:34.68	2026-04-17 04:47:34.68	IMAGE	f	f	f	f	\N	\N
520	shops/shop-products/product-images/1317/6c7a7f723f3d0196775d7ce184b43788.jpg	\N	13	1317	2026-04-17 04:47:34.916	2026-04-17 04:47:34.916	IMAGE	f	f	f	f	\N	\N
521	shops/shop-products/product-images/703/0db6d3880777fc6b6b5553f5ccb34f6c.jpg	\N	13	703	2026-04-17 04:47:35.208	2026-04-17 04:47:35.208	IMAGE	f	f	f	f	\N	\N
522	shops/shop-products/product-images/1320/f56dee085e970c8286c2444a66b1f274.png	\N	13	1320	2026-04-17 04:47:35.502	2026-04-17 04:47:35.502	IMAGE	f	f	f	f	\N	\N
523	shops/shop-products/product-images/705/5beedaf97c6d35790c8b39b8490724af.jpg	\N	13	705	2026-04-17 04:47:35.711	2026-04-17 04:47:35.711	IMAGE	f	f	f	f	\N	\N
524	shops/shop-products/product-images/704/f56dee085e970c8286c2444a66b1f274.png	\N	13	704	2026-04-17 04:47:35.808	2026-04-17 04:47:35.808	IMAGE	f	f	f	f	\N	\N
525	shops/shop-products/product-images/1318/bd2af174fbc4796e774b89c06223bfc4.png	\N	13	1318	2026-04-17 04:47:35.933	2026-04-17 04:47:35.933	IMAGE	f	f	f	f	\N	\N
526	shops/shop-products/product-images/702/bd2af174fbc4796e774b89c06223bfc4.png	\N	13	702	2026-04-17 04:47:36.457	2026-04-17 04:47:36.457	IMAGE	f	f	f	f	\N	\N
527	shops/shop-products/product-images/1314/bd2af174fbc4796e774b89c06223bfc4.png	\N	13	1314	2026-04-17 04:47:36.487	2026-04-17 04:47:36.487	IMAGE	f	f	f	f	\N	\N
528	shops/shop-products/product-images/166/0e3e8eede4f802fdbcd0b549c912642c.jpg	\N	13	\N	2026-04-17 04:49:39.919	2026-04-17 04:49:39.919	IMAGE	f	f	f	f	\N	166
529	shops/shop-products/product-images/1323/a72916ac0ed53e2781fc919827d4ee5b.jpg	\N	13	1323	2026-04-17 04:49:40.909	2026-04-17 04:49:40.909	IMAGE	f	f	f	f	\N	\N
530	shops/shop-products/product-images/821/a72916ac0ed53e2781fc919827d4ee5b.jpg	\N	13	821	2026-04-17 04:49:41.245	2026-04-17 04:49:41.245	IMAGE	f	f	f	f	\N	\N
531	shops/shop-products/product-images/1321/71857621c7c31b13a19807c46aebfff8.jpg	\N	13	1321	2026-04-17 04:49:41.694	2026-04-17 04:49:41.694	IMAGE	f	f	f	f	\N	\N
532	shops/shop-products/product-images/1324/4d518753caf4aab1be81fbc94ac431ad.jpg	\N	13	1324	2026-04-17 04:49:41.945	2026-04-17 04:49:41.945	IMAGE	f	f	f	f	\N	\N
533	shops/shop-products/product-images/1326/1edd17fec6b7ae3abb0e0515c3b4b08a.jpg	\N	13	1326	2026-04-17 04:49:42.122	2026-04-17 04:49:42.122	IMAGE	f	f	f	f	\N	\N
534	shops/shop-products/product-images/1329/a72916ac0ed53e2781fc919827d4ee5b.jpg	\N	13	1329	2026-04-17 04:49:42.601	2026-04-17 04:49:42.601	IMAGE	f	f	f	f	\N	\N
535	shops/shop-products/product-images/1327/94bff9af1fe3e59348f77acf1b36be85.jpg	\N	13	1327	2026-04-17 04:49:42.63	2026-04-17 04:49:42.63	IMAGE	f	f	f	f	\N	\N
536	shops/shop-products/product-images/1328/4d518753caf4aab1be81fbc94ac431ad.jpg	\N	13	1328	2026-04-17 04:49:43.009	2026-04-17 04:49:43.009	IMAGE	f	f	f	f	\N	\N
537	shops/shop-products/product-images/1322/94bff9af1fe3e59348f77acf1b36be85.jpg	\N	13	1322	2026-04-17 04:49:43.091	2026-04-17 04:49:43.091	IMAGE	f	f	f	f	\N	\N
538	shops/shop-products/product-images/1325/1edd17fec6b7ae3abb0e0515c3b4b08a.jpg	\N	13	1325	2026-04-17 04:49:43.22	2026-04-17 04:49:43.22	IMAGE	f	f	f	f	\N	\N
539	shops/shop-products/product-images/1332/4d518753caf4aab1be81fbc94ac431ad.jpg	\N	13	1332	2026-04-17 04:49:43.327	2026-04-17 04:49:43.327	IMAGE	f	f	f	f	\N	\N
540	shops/shop-products/product-images/1333/a72916ac0ed53e2781fc919827d4ee5b.jpg	\N	13	1333	2026-04-17 04:49:43.369	2026-04-17 04:49:43.369	IMAGE	f	f	f	f	\N	\N
541	shops/shop-products/product-images/1336/4d518753caf4aab1be81fbc94ac431ad.jpg	\N	13	1336	2026-04-17 04:49:43.965	2026-04-17 04:49:43.965	IMAGE	f	f	f	f	\N	\N
542	shops/shop-products/product-images/1331/94bff9af1fe3e59348f77acf1b36be85.jpg	\N	13	1331	2026-04-17 04:49:44.128	2026-04-17 04:49:44.128	IMAGE	f	f	f	f	\N	\N
543	shops/shop-products/product-images/1337/a72916ac0ed53e2781fc919827d4ee5b.jpg	\N	13	1337	2026-04-17 04:49:44.345	2026-04-17 04:49:44.345	IMAGE	f	f	f	f	\N	\N
544	shops/shop-products/product-images/1334/71857621c7c31b13a19807c46aebfff8.jpg	\N	13	1334	2026-04-17 04:49:44.416	2026-04-17 04:49:44.416	IMAGE	f	f	f	f	\N	\N
545	shops/shop-products/product-images/1330/71857621c7c31b13a19807c46aebfff8.jpg	\N	13	1330	2026-04-17 04:49:44.56	2026-04-17 04:49:44.56	IMAGE	f	f	f	f	\N	\N
546	shops/shop-products/product-images/1338/71857621c7c31b13a19807c46aebfff8.jpg	\N	13	1338	2026-04-17 04:49:45.211	2026-04-17 04:49:45.211	IMAGE	f	f	f	f	\N	\N
547	shops/shop-products/product-images/822/71857621c7c31b13a19807c46aebfff8.jpg	\N	13	822	2026-04-17 04:49:45.24	2026-04-17 04:49:45.24	IMAGE	f	f	f	f	\N	\N
548	shops/shop-products/product-images/823/1edd17fec6b7ae3abb0e0515c3b4b08a.jpg	\N	13	823	2026-04-17 04:49:45.538	2026-04-17 04:49:45.538	IMAGE	f	f	f	f	\N	\N
549	shops/shop-products/product-images/825/4d518753caf4aab1be81fbc94ac431ad.jpg	\N	13	825	2026-04-17 04:49:46.117	2026-04-17 04:49:46.117	IMAGE	f	f	f	f	\N	\N
550	shops/shop-products/product-images/1340/94bff9af1fe3e59348f77acf1b36be85.jpg	\N	13	1340	2026-04-17 04:49:46.135	2026-04-17 04:49:46.135	IMAGE	f	f	f	f	\N	\N
551	shops/shop-products/product-images/824/94bff9af1fe3e59348f77acf1b36be85.jpg	\N	13	824	2026-04-17 04:49:46.37	2026-04-17 04:49:46.37	IMAGE	f	f	f	f	\N	\N
552	shops/shop-products/product-images/1335/1edd17fec6b7ae3abb0e0515c3b4b08a.jpg	\N	13	1335	2026-04-17 04:49:46.626	2026-04-17 04:49:46.626	IMAGE	f	f	f	f	\N	\N
553	shops/shop-products/product-images/1339/1edd17fec6b7ae3abb0e0515c3b4b08a.jpg	\N	13	1339	2026-04-17 04:49:46.896	2026-04-17 04:49:46.896	IMAGE	f	f	f	f	\N	\N
554	shops/shop-products/product-images/168/0f962fa197dd02725b6afdd61190c83f.jpg	\N	13	\N	2026-04-17 04:50:40.611	2026-04-17 04:50:40.611	IMAGE	f	f	f	f	\N	168
555	shops/shop-products/product-images/1342/7dd9f251fb2a49d51ca8f2e510576c2e.webp	\N	13	1342	2026-04-17 04:50:40.967	2026-04-17 04:50:40.967	IMAGE	f	f	f	f	\N	\N
556	shops/shop-products/product-images/1343/ab916f8df5d93f8a978911b49bcf9d6e.webp	\N	13	1343	2026-04-17 04:50:41.02	2026-04-17 04:50:41.02	IMAGE	f	f	f	f	\N	\N
557	shops/shop-products/product-images/1341/92f62424129f2f29cd4dcf41823465d4.jpg	\N	13	1341	2026-04-17 04:50:41.04	2026-04-17 04:50:41.04	IMAGE	f	f	f	f	\N	\N
558	shops/shop-products/product-images/1346/7dd9f251fb2a49d51ca8f2e510576c2e.webp	\N	13	1346	2026-04-17 04:50:41.252	2026-04-17 04:50:41.252	IMAGE	f	f	f	f	\N	\N
559	shops/shop-products/product-images/1347/92f62424129f2f29cd4dcf41823465d4.jpg	\N	13	1347	2026-04-17 04:50:41.337	2026-04-17 04:50:41.337	IMAGE	f	f	f	f	\N	\N
560	shops/shop-products/product-images/831/47e9d4ec77c1324e6df8b2500df367c5.jpg	\N	13	831	2026-04-17 04:50:41.451	2026-04-17 04:50:41.451	IMAGE	f	f	f	f	\N	\N
561	shops/shop-products/product-images/1351/92f62424129f2f29cd4dcf41823465d4.jpg	\N	13	1351	2026-04-17 04:50:41.768	2026-04-17 04:50:41.768	IMAGE	f	f	f	f	\N	\N
562	shops/shop-products/product-images/1350/ab916f8df5d93f8a978911b49bcf9d6e.webp	\N	13	1350	2026-04-17 04:50:41.89	2026-04-17 04:50:41.89	IMAGE	f	f	f	f	\N	\N
563	shops/shop-products/product-images/1344/47e9d4ec77c1324e6df8b2500df367c5.jpg	\N	13	1344	2026-04-17 04:50:42.108	2026-04-17 04:50:42.108	IMAGE	f	f	f	f	\N	\N
564	shops/shop-products/product-images/1349/47e9d4ec77c1324e6df8b2500df367c5.jpg	\N	13	1349	2026-04-17 04:50:42.483	2026-04-17 04:50:42.483	IMAGE	f	f	f	f	\N	\N
565	shops/shop-products/product-images/1353/47e9d4ec77c1324e6df8b2500df367c5.jpg	\N	13	1353	2026-04-17 04:50:42.495	2026-04-17 04:50:42.495	IMAGE	f	f	f	f	\N	\N
566	shops/shop-products/product-images/1355/7dd9f251fb2a49d51ca8f2e510576c2e.webp	\N	13	1355	2026-04-17 04:50:42.731	2026-04-17 04:50:42.731	IMAGE	f	f	f	f	\N	\N
567	shops/shop-products/product-images/1354/ab916f8df5d93f8a978911b49bcf9d6e.webp	\N	13	1354	2026-04-17 04:50:42.88	2026-04-17 04:50:42.88	IMAGE	f	f	f	f	\N	\N
568	shops/shop-products/product-images/1357/47e9d4ec77c1324e6df8b2500df367c5.jpg	\N	13	1357	2026-04-17 04:50:43.057	2026-04-17 04:50:43.057	IMAGE	f	f	f	f	\N	\N
569	shops/shop-products/product-images/1358/ab916f8df5d93f8a978911b49bcf9d6e.webp	\N	13	1358	2026-04-17 04:50:43.231	2026-04-17 04:50:43.231	IMAGE	f	f	f	f	\N	\N
570	shops/shop-products/product-images/1359/7dd9f251fb2a49d51ca8f2e510576c2e.webp	\N	13	1359	2026-04-17 04:50:43.356	2026-04-17 04:50:43.356	IMAGE	f	f	f	f	\N	\N
571	shops/shop-products/product-images/1360/92f62424129f2f29cd4dcf41823465d4.jpg	\N	13	1360	2026-04-17 04:50:43.519	2026-04-17 04:50:43.519	IMAGE	f	f	f	f	\N	\N
572	shops/shop-products/product-images/832/ab916f8df5d93f8a978911b49bcf9d6e.webp	\N	13	832	2026-04-17 04:50:43.654	2026-04-17 04:50:43.654	IMAGE	f	f	f	f	\N	\N
573	shops/shop-products/product-images/833/7dd9f251fb2a49d51ca8f2e510576c2e.webp	\N	13	833	2026-04-17 04:50:43.769	2026-04-17 04:50:43.769	IMAGE	f	f	f	f	\N	\N
574	shops/shop-products/product-images/834/92f62424129f2f29cd4dcf41823465d4.jpg	\N	13	834	2026-04-17 04:50:43.993	2026-04-17 04:50:43.993	IMAGE	f	f	f	f	\N	\N
575	shops/shop-products/product-images/1345/6b36520cfcd5b7f8ee15d937501a2ab7.png	\N	13	1345	2026-04-17 04:50:46.517	2026-04-17 04:50:46.517	IMAGE	f	f	f	f	\N	\N
576	shops/shop-products/product-images/1352/6b36520cfcd5b7f8ee15d937501a2ab7.png	\N	13	1352	2026-04-17 04:50:46.961	2026-04-17 04:50:46.961	IMAGE	f	f	f	f	\N	\N
577	shops/shop-products/product-images/1348/6b36520cfcd5b7f8ee15d937501a2ab7.png	\N	13	1348	2026-04-17 04:50:47.132	2026-04-17 04:50:47.132	IMAGE	f	f	f	f	\N	\N
578	shops/shop-products/product-images/1356/6b36520cfcd5b7f8ee15d937501a2ab7.png	\N	13	1356	2026-04-17 04:50:47.691	2026-04-17 04:50:47.691	IMAGE	f	f	f	f	\N	\N
579	shops/shop-products/product-images/835/6b36520cfcd5b7f8ee15d937501a2ab7.png	\N	13	835	2026-04-17 04:50:49.064	2026-04-17 04:50:49.064	IMAGE	f	f	f	f	\N	\N
580	shops/shop-products/product-images/152/5b008059debf3f465edd33200860b5fe.jpg	\N	13	\N	2026-04-17 04:53:48.095	2026-04-17 04:53:48.095	IMAGE	f	f	f	f	\N	152
581	shops/shop-products/product-images/1362/8cb32a77faa092b6dd6f27ed3e0429cd.jpg	\N	13	1362	2026-04-17 04:53:48.546	2026-04-17 04:53:48.546	IMAGE	f	f	f	f	\N	\N
582	shops/shop-products/product-images/1366/1c695ac82be73a1c6e3f676fc80f0e5d.jpg	\N	13	1366	2026-04-17 04:53:48.836	2026-04-17 04:53:48.836	IMAGE	f	f	f	f	\N	\N
583	shops/shop-products/product-images/1364/1c695ac82be73a1c6e3f676fc80f0e5d.jpg	\N	13	1364	2026-04-17 04:53:48.874	2026-04-17 04:53:48.874	IMAGE	f	f	f	f	\N	\N
585	shops/shop-products/product-images/1365/e966d9b4e840e03e91be90912dca0998.jpg	\N	13	1365	2026-04-17 04:53:48.941	2026-04-17 04:53:48.941	IMAGE	f	f	f	f	\N	\N
586	shops/shop-products/product-images/1361/55a7412becfb73b0ecbe7ef08c6fc1f4.jpg	\N	13	1361	2026-04-17 04:53:48.988	2026-04-17 04:53:48.988	IMAGE	f	f	f	f	\N	\N
587	shops/shop-products/product-images/1363/f72f6fef9042b996288618dc35405654.jpg	\N	13	1363	2026-04-17 04:53:49.119	2026-04-17 04:53:49.119	IMAGE	f	f	f	f	\N	\N
588	shops/shop-products/product-images/1369/e966d9b4e840e03e91be90912dca0998.jpg	\N	13	1369	2026-04-17 04:53:49.202	2026-04-17 04:53:49.202	IMAGE	f	f	f	f	\N	\N
589	shops/shop-products/product-images/1367/55a7412becfb73b0ecbe7ef08c6fc1f4.jpg	\N	13	1367	2026-04-17 04:53:49.348	2026-04-17 04:53:49.348	IMAGE	f	f	f	f	\N	\N
590	shops/shop-products/product-images/1368/f72f6fef9042b996288618dc35405654.jpg	\N	13	1368	2026-04-17 04:53:49.565	2026-04-17 04:53:49.565	IMAGE	f	f	f	f	\N	\N
591	shops/shop-products/product-images/1371/55a7412becfb73b0ecbe7ef08c6fc1f4.jpg	\N	13	1371	2026-04-17 04:53:49.684	2026-04-17 04:53:49.684	IMAGE	f	f	f	f	\N	\N
592	shops/shop-products/product-images/1373/e966d9b4e840e03e91be90912dca0998.jpg	\N	13	1373	2026-04-17 04:53:49.826	2026-04-17 04:53:49.826	IMAGE	f	f	f	f	\N	\N
593	shops/shop-products/product-images/1370/8cb32a77faa092b6dd6f27ed3e0429cd.jpg	\N	13	1370	2026-04-17 04:53:49.982	2026-04-17 04:53:49.982	IMAGE	f	f	f	f	\N	\N
594	shops/shop-products/product-images/1375/1c695ac82be73a1c6e3f676fc80f0e5d.jpg	\N	13	1375	2026-04-17 04:53:50.008	2026-04-17 04:53:50.008	IMAGE	f	f	f	f	\N	\N
595	shops/shop-products/product-images/1377/e966d9b4e840e03e91be90912dca0998.jpg	\N	13	1377	2026-04-17 04:53:50.133	2026-04-17 04:53:50.133	IMAGE	f	f	f	f	\N	\N
596	shops/shop-products/product-images/1376/f72f6fef9042b996288618dc35405654.jpg	\N	13	1376	2026-04-17 04:53:50.22	2026-04-17 04:53:50.22	IMAGE	f	f	f	f	\N	\N
597	shops/shop-products/product-images/1379/1c695ac82be73a1c6e3f676fc80f0e5d.jpg	\N	13	1379	2026-04-17 04:53:50.298	2026-04-17 04:53:50.298	IMAGE	f	f	f	f	\N	\N
598	shops/shop-products/product-images/1372/f72f6fef9042b996288618dc35405654.jpg	\N	13	1372	2026-04-17 04:53:50.459	2026-04-17 04:53:50.459	IMAGE	f	f	f	f	\N	\N
599	shops/shop-products/product-images/753/1c695ac82be73a1c6e3f676fc80f0e5d.jpg	\N	13	753	2026-04-17 04:53:50.593	2026-04-17 04:53:50.593	IMAGE	f	f	f	f	\N	\N
600	shops/shop-products/product-images/1374/8cb32a77faa092b6dd6f27ed3e0429cd.jpg	\N	13	1374	2026-04-17 04:53:50.899	2026-04-17 04:53:50.899	IMAGE	f	f	f	f	\N	\N
601	shops/shop-products/product-images/1380/55a7412becfb73b0ecbe7ef08c6fc1f4.jpg	\N	13	1380	2026-04-17 04:53:51.099	2026-04-17 04:53:51.099	IMAGE	f	f	f	f	\N	\N
602	shops/shop-products/product-images/1378/8cb32a77faa092b6dd6f27ed3e0429cd.jpg	\N	13	1378	2026-04-17 04:53:51.454	2026-04-17 04:53:51.454	IMAGE	f	f	f	f	\N	\N
603	shops/shop-products/product-images/754/55a7412becfb73b0ecbe7ef08c6fc1f4.jpg	\N	13	754	2026-04-17 04:53:51.638	2026-04-17 04:53:51.638	IMAGE	f	f	f	f	\N	\N
604	shops/shop-products/product-images/755/f72f6fef9042b996288618dc35405654.jpg	\N	13	755	2026-04-17 04:53:51.688	2026-04-17 04:53:51.688	IMAGE	f	f	f	f	\N	\N
605	shops/shop-products/product-images/752/8cb32a77faa092b6dd6f27ed3e0429cd.jpg	\N	13	752	2026-04-17 04:53:51.741	2026-04-17 04:53:51.741	IMAGE	f	f	f	f	\N	\N
584	shops/shop-products/product-images/751/e966d9b4e840e03e91be90912dca0998.jpg	\N	13	751	2026-04-17 04:53:48.915	2026-04-17 04:53:48.915	IMAGE	f	f	f	f	\N	\N
606	shops/shop-products/product-images/153/5124add0c34789ed6f390941cdbdbcaf.jpg	\N	13	\N	2026-04-17 04:54:59.359	2026-04-17 04:54:59.359	IMAGE	f	f	f	f	\N	153
607	shops/shop-products/product-images/1385/6df9fd4fed358f56b8b3ef85426741c5.jpg	\N	13	1385	2026-04-17 04:55:00.297	2026-04-17 04:55:00.297	IMAGE	f	f	f	f	\N	\N
608	shops/shop-products/product-images/1384/f2e162b70dd654204e9bbe24590d6c46.jpg	\N	13	1384	2026-04-17 04:55:00.339	2026-04-17 04:55:00.339	IMAGE	f	f	f	f	\N	\N
609	shops/shop-products/product-images/1381/d2a4c9f9ac1c5b2ee964a0c5a8a06e89.webp	\N	13	1381	2026-04-17 04:55:00.395	2026-04-17 04:55:00.395	IMAGE	f	f	f	f	\N	\N
610	shops/shop-products/product-images/756/55c4095442731e334b8aab3b3d82e1e2.jpg	\N	13	756	2026-04-17 04:55:00.442	2026-04-17 04:55:00.442	IMAGE	f	f	f	f	\N	\N
611	shops/shop-products/product-images/1386/6df9fd4fed358f56b8b3ef85426741c5.jpg	\N	13	1386	2026-04-17 04:55:00.607	2026-04-17 04:55:00.607	IMAGE	f	f	f	f	\N	\N
612	shops/shop-products/product-images/1383/55c4095442731e334b8aab3b3d82e1e2.jpg	\N	13	1383	2026-04-17 04:55:00.733	2026-04-17 04:55:00.733	IMAGE	f	f	f	f	\N	\N
613	shops/shop-products/product-images/1387/8ff0b7fc4b71e7df93badfbd9f4157d7.jpg	\N	13	1387	2026-04-17 04:55:00.811	2026-04-17 04:55:00.811	IMAGE	f	f	f	f	\N	\N
614	shops/shop-products/product-images/1382/8ff0b7fc4b71e7df93badfbd9f4157d7.jpg	\N	13	1382	2026-04-17 04:55:00.856	2026-04-17 04:55:00.856	IMAGE	f	f	f	f	\N	\N
615	shops/shop-products/product-images/1388/f2e162b70dd654204e9bbe24590d6c46.jpg	\N	13	1388	2026-04-17 04:55:01.164	2026-04-17 04:55:01.164	IMAGE	f	f	f	f	\N	\N
616	shops/shop-products/product-images/1392/f2e162b70dd654204e9bbe24590d6c46.jpg	\N	13	1392	2026-04-17 04:55:01.253	2026-04-17 04:55:01.253	IMAGE	f	f	f	f	\N	\N
617	shops/shop-products/product-images/1395/6df9fd4fed358f56b8b3ef85426741c5.jpg	\N	13	1395	2026-04-17 04:55:01.53	2026-04-17 04:55:01.53	IMAGE	f	f	f	f	\N	\N
618	shops/shop-products/product-images/1390/d2a4c9f9ac1c5b2ee964a0c5a8a06e89.webp	\N	13	1390	2026-04-17 04:55:01.574	2026-04-17 04:55:01.574	IMAGE	f	f	f	f	\N	\N
619	shops/shop-products/product-images/1393/55c4095442731e334b8aab3b3d82e1e2.jpg	\N	13	1393	2026-04-17 04:55:01.73	2026-04-17 04:55:01.73	IMAGE	f	f	f	f	\N	\N
620	shops/shop-products/product-images/1391/8ff0b7fc4b71e7df93badfbd9f4157d7.jpg	\N	13	1391	2026-04-17 04:55:01.758	2026-04-17 04:55:01.758	IMAGE	f	f	f	f	\N	\N
621	shops/shop-products/product-images/1396/f2e162b70dd654204e9bbe24590d6c46.jpg	\N	13	1396	2026-04-17 04:55:01.88	2026-04-17 04:55:01.88	IMAGE	f	f	f	f	\N	\N
622	shops/shop-products/product-images/1399/6df9fd4fed358f56b8b3ef85426741c5.jpg	\N	13	1399	2026-04-17 04:55:02.152	2026-04-17 04:55:02.152	IMAGE	f	f	f	f	\N	\N
623	shops/shop-products/product-images/1389/55c4095442731e334b8aab3b3d82e1e2.jpg	\N	13	1389	2026-04-17 04:55:02.152	2026-04-17 04:55:02.152	IMAGE	f	f	f	f	\N	\N
624	shops/shop-products/product-images/758/6df9fd4fed358f56b8b3ef85426741c5.jpg	\N	13	758	2026-04-17 04:55:02.433	2026-04-17 04:55:02.433	IMAGE	f	f	f	f	\N	\N
625	shops/shop-products/product-images/1397/55c4095442731e334b8aab3b3d82e1e2.jpg	\N	13	1397	2026-04-17 04:55:02.453	2026-04-17 04:55:02.453	IMAGE	f	f	f	f	\N	\N
626	shops/shop-products/product-images/1394/d2a4c9f9ac1c5b2ee964a0c5a8a06e89.webp	\N	13	1394	2026-04-17 04:55:02.646	2026-04-17 04:55:02.646	IMAGE	f	f	f	f	\N	\N
627	shops/shop-products/product-images/760/f2e162b70dd654204e9bbe24590d6c46.jpg	\N	13	760	2026-04-17 04:55:02.84	2026-04-17 04:55:02.84	IMAGE	f	f	f	f	\N	\N
628	shops/shop-products/product-images/1400/8ff0b7fc4b71e7df93badfbd9f4157d7.jpg	\N	13	1400	2026-04-17 04:55:02.926	2026-04-17 04:55:02.926	IMAGE	f	f	f	f	\N	\N
629	shops/shop-products/product-images/1398/d2a4c9f9ac1c5b2ee964a0c5a8a06e89.webp	\N	13	1398	2026-04-17 04:55:03.356	2026-04-17 04:55:03.356	IMAGE	f	f	f	f	\N	\N
630	shops/shop-products/product-images/759/8ff0b7fc4b71e7df93badfbd9f4157d7.jpg	\N	13	759	2026-04-17 04:55:03.389	2026-04-17 04:55:03.389	IMAGE	f	f	f	f	\N	\N
631	shops/shop-products/product-images/757/d2a4c9f9ac1c5b2ee964a0c5a8a06e89.webp	\N	13	757	2026-04-17 04:55:03.637	2026-04-17 04:55:03.637	IMAGE	f	f	f	f	\N	\N
632	shops/shop-products/product-images/161/96004f4e79348176ccae6060ef303bbf.jpg	\N	13	\N	2026-04-17 04:57:50.521	2026-04-17 04:57:50.521	IMAGE	f	f	f	f	\N	161
633	shops/shop-products/product-images/1403/06d223f604cca2c498cc3fbe11187b9b.jpg	\N	13	1403	2026-04-17 04:57:50.94	2026-04-17 04:57:50.94	IMAGE	f	f	f	f	\N	\N
634	shops/shop-products/product-images/1401/a267c767e0954d2c4dfa98621b0c99f0.jpg	\N	13	1401	2026-04-17 04:57:50.957	2026-04-17 04:57:50.957	IMAGE	f	f	f	f	\N	\N
635	shops/shop-products/product-images/1405/5540897e88fa4ee21de65c9020c9527b.jpg	\N	13	1405	2026-04-17 04:57:51.035	2026-04-17 04:57:51.035	IMAGE	f	f	f	f	\N	\N
636	shops/shop-products/product-images/1402/df4b8080ce55629194ffd0401f8496ef.jpg	\N	13	1402	2026-04-17 04:57:51.045	2026-04-17 04:57:51.045	IMAGE	f	f	f	f	\N	\N
637	shops/shop-products/product-images/1406/06d223f604cca2c498cc3fbe11187b9b.jpg	\N	13	1406	2026-04-17 04:57:51.254	2026-04-17 04:57:51.254	IMAGE	f	f	f	f	\N	\N
638	shops/shop-products/product-images/796/5540897e88fa4ee21de65c9020c9527b.jpg	\N	13	796	2026-04-17 04:57:51.327	2026-04-17 04:57:51.327	IMAGE	f	f	f	f	\N	\N
639	shops/shop-products/product-images/1409/5540897e88fa4ee21de65c9020c9527b.jpg	\N	13	1409	2026-04-17 04:57:51.391	2026-04-17 04:57:51.391	IMAGE	f	f	f	f	\N	\N
640	shops/shop-products/product-images/1408/7ce9755bdf7ed0626e5522dda00359b7.jpg	\N	13	1408	2026-04-17 04:57:51.466	2026-04-17 04:57:51.466	IMAGE	f	f	f	f	\N	\N
641	shops/shop-products/product-images/1404/7ce9755bdf7ed0626e5522dda00359b7.jpg	\N	13	1404	2026-04-17 04:57:51.477	2026-04-17 04:57:51.477	IMAGE	f	f	f	f	\N	\N
642	shops/shop-products/product-images/1410/a267c767e0954d2c4dfa98621b0c99f0.jpg	\N	13	1410	2026-04-17 04:57:51.536	2026-04-17 04:57:51.536	IMAGE	f	f	f	f	\N	\N
643	shops/shop-products/product-images/1412/7ce9755bdf7ed0626e5522dda00359b7.jpg	\N	13	1412	2026-04-17 04:57:51.735	2026-04-17 04:57:51.735	IMAGE	f	f	f	f	\N	\N
644	shops/shop-products/product-images/1413/5540897e88fa4ee21de65c9020c9527b.jpg	\N	13	1413	2026-04-17 04:57:51.773	2026-04-17 04:57:51.773	IMAGE	f	f	f	f	\N	\N
645	shops/shop-products/product-images/1411/df4b8080ce55629194ffd0401f8496ef.jpg	\N	13	1411	2026-04-17 04:57:51.793	2026-04-17 04:57:51.793	IMAGE	f	f	f	f	\N	\N
646	shops/shop-products/product-images/1415/06d223f604cca2c498cc3fbe11187b9b.jpg	\N	13	1415	2026-04-17 04:57:51.853	2026-04-17 04:57:51.853	IMAGE	f	f	f	f	\N	\N
647	shops/shop-products/product-images/1414/a267c767e0954d2c4dfa98621b0c99f0.jpg	\N	13	1414	2026-04-17 04:57:51.879	2026-04-17 04:57:51.879	IMAGE	f	f	f	f	\N	\N
648	shops/shop-products/product-images/797/a267c767e0954d2c4dfa98621b0c99f0.jpg	\N	13	797	2026-04-17 04:57:52.024	2026-04-17 04:57:52.024	IMAGE	f	f	f	f	\N	\N
649	shops/shop-products/product-images/1418/a267c767e0954d2c4dfa98621b0c99f0.jpg	\N	13	1418	2026-04-17 04:57:52.156	2026-04-17 04:57:52.156	IMAGE	f	f	f	f	\N	\N
650	shops/shop-products/product-images/1407/df4b8080ce55629194ffd0401f8496ef.jpg	\N	13	1407	2026-04-17 04:57:52.23	2026-04-17 04:57:52.23	IMAGE	f	f	f	f	\N	\N
651	shops/shop-products/product-images/1416/7ce9755bdf7ed0626e5522dda00359b7.jpg	\N	13	1416	2026-04-17 04:57:52.282	2026-04-17 04:57:52.282	IMAGE	f	f	f	f	\N	\N
652	shops/shop-products/product-images/1419/06d223f604cca2c498cc3fbe11187b9b.jpg	\N	13	1419	2026-04-17 04:57:52.332	2026-04-17 04:57:52.332	IMAGE	f	f	f	f	\N	\N
653	shops/shop-products/product-images/1417/5540897e88fa4ee21de65c9020c9527b.jpg	\N	13	1417	2026-04-17 04:57:52.425	2026-04-17 04:57:52.425	IMAGE	f	f	f	f	\N	\N
654	shops/shop-products/product-images/798/06d223f604cca2c498cc3fbe11187b9b.jpg	\N	13	798	2026-04-17 04:57:52.477	2026-04-17 04:57:52.477	IMAGE	f	f	f	f	\N	\N
655	shops/shop-products/product-images/1420/df4b8080ce55629194ffd0401f8496ef.jpg	\N	13	1420	2026-04-17 04:57:52.526	2026-04-17 04:57:52.526	IMAGE	f	f	f	f	\N	\N
656	shops/shop-products/product-images/800/7ce9755bdf7ed0626e5522dda00359b7.jpg	\N	13	800	2026-04-17 04:57:52.643	2026-04-17 04:57:52.643	IMAGE	f	f	f	f	\N	\N
657	shops/shop-products/product-images/799/df4b8080ce55629194ffd0401f8496ef.jpg	\N	13	799	2026-04-17 04:57:52.689	2026-04-17 04:57:52.689	IMAGE	f	f	f	f	\N	\N
\.


--
-- TOC entry 3870 (class 0 OID 17946)
-- Dependencies: 231
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Message" (id, content, "senderId", "roomChatId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3872 (class 0 OID 17953)
-- Dependencies: 233
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, title, content, type, "creatorId", "recipientId", "isRead", "createdAt", "updatedAt") FROM stdin;
1	Order placed successfully	Your order #1 has been created and is waiting for processing.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 07:46:33.296	2026-04-22 07:46:33.296
34	Order is waiting for pickup	Your order #1 is now prepared and waiting for carrier pickup.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 08:01:14.999	2026-04-22 08:01:14.999
35	Order has been shipped	Your order #1 is on the way.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 08:01:55.657	2026-04-22 08:01:55.657
36	Order delivered successfully	Your order #1 has been delivered successfully.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 08:02:24.837	2026-04-22 08:02:24.837
37	Order placed successfully	Your order #34 has been created and is waiting for processing.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 08:04:56.115	2026-04-22 08:04:56.115
38	Order is waiting for pickup	Your order #34 is now prepared and waiting for carrier pickup.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 08:05:31.65	2026-04-22 08:05:31.65
39	Order has been shipped	Your order #34 is on the way.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 08:05:45.466	2026-04-22 08:05:45.466
40	Order delivered successfully	Your order #34 has been delivered successfully.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 08:06:07.152	2026-04-22 08:06:07.152
41	Order placed successfully	Your order #35 has been created and is waiting for processing.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 08:08:56.744	2026-04-22 08:08:56.744
42	Order cancelled	Your order #35 has been cancelled.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 08:10:02.353	2026-04-22 08:10:02.353
43	Order placed successfully	Your order #36 has been created and is waiting for processing.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 08:10:54.393	2026-04-22 08:10:54.393
44	Order cancelled	Your order #36 has been cancelled.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 08:13:22.581	2026-04-22 08:13:22.581
45	Order placed successfully	Your order #37 has been created and is waiting for processing.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 08:16:06.774	2026-04-22 08:16:06.774
46	Order cancelled	Your order #37 has been cancelled.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 08:20:01.26	2026-04-22 08:20:01.26
79	Order placed successfully	Your order #38 has been created and is waiting for processing.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 08:32:35.769	2026-04-22 08:32:35.769
80	Order cancelled	Your order #38 has been cancelled.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:05:01.914	2026-04-22 09:05:01.914
81	Order placed successfully	Your order #39 has been created and is waiting for processing.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:13:11.243	2026-04-22 09:13:11.243
82	Payment confirmed	Your payment for order #39 has been confirmed successfully.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:19:45.675	2026-04-22 09:19:45.675
83	Order is waiting for pickup	Your order #39 is now prepared and waiting for carrier pickup.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:21:22.957	2026-04-22 09:21:22.957
84	Order has been shipped	Your order #39 is on the way.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:21:48.99	2026-04-22 09:21:48.99
85	Order delivered successfully	Your order #39 has been delivered successfully.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:21:51.26	2026-04-22 09:21:51.26
86	Return request created	Your return request #1 has been created and is pending review.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:22:38.846	2026-04-22 09:22:38.846
87	Order placed successfully	Your order #40 has been created and is waiting for processing.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:46:49.746	2026-04-22 09:46:49.746
88	Order placed successfully	Your order #41 has been created and is waiting for processing.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:47:28.462	2026-04-22 09:47:28.462
89	Payment confirmed	Your payment for order #41 has been confirmed successfully.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:48:01.917	2026-04-22 09:48:01.917
90	Order is waiting for pickup	Your order #41 is now prepared and waiting for carrier pickup.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:48:37.655	2026-04-22 09:48:37.655
91	Order has been shipped	Your order #41 is on the way.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:48:51.748	2026-04-22 09:48:51.748
92	Order is waiting for pickup	Your order #40 is now prepared and waiting for carrier pickup.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:48:59.528	2026-04-22 09:48:59.528
93	Order has been shipped	Your order #40 is on the way.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:49:02.882	2026-04-22 09:49:02.882
94	Order placed successfully	Your order #42 has been created and is waiting for processing.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:50:43.1	2026-04-22 09:50:43.1
95	Order placed successfully	Your order #43 has been created and is waiting for processing.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:53:38.036	2026-04-22 09:53:38.036
96	Order placed successfully	Your order #44 has been created and is waiting for processing.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:54:25.244	2026-04-22 09:54:25.244
97	Payment confirmed	Your payment for order #44 has been confirmed successfully.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:54:59.221	2026-04-22 09:54:59.221
98	Order is waiting for pickup	Your order #44 is now prepared and waiting for carrier pickup.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:55:25.155	2026-04-22 09:55:25.155
99	Order is waiting for pickup	Your order #43 is now prepared and waiting for carrier pickup.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:55:30.813	2026-04-22 09:55:30.813
100	Order placed successfully	Your order #45 has been created and is waiting for processing.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:56:18.404	2026-04-22 09:56:18.404
101	Payment confirmed	Your payment for order #45 has been confirmed successfully.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:56:59.63	2026-04-22 09:56:59.63
102	Order is waiting for pickup	Your order #45 is now prepared and waiting for carrier pickup.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:57:28.053	2026-04-22 09:57:28.053
103	Order has been shipped	Your order #45 is on the way.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:57:29.561	2026-04-22 09:57:29.561
104	Order delivery failed	Delivery for order #45 failed. Our team will support you with next steps.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 09:57:30.849	2026-04-22 09:57:30.849
105	Order cancelled	Your order #42 has been cancelled.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-22 10:10:00.67	2026-04-22 10:10:00.67
106	Order placed successfully	Your order #46 has been created and is waiting for processing.	PERSONAL_NOTIFICATION	\N	11	f	2026-04-24 15:28:35.218	2026-04-24 15:28:35.218
\.


--
-- TOC entry 3874 (class 0 OID 17962)
-- Dependencies: 235
-- Data for Name: OrderItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItems" (id, "orderId", "productVariantId", quantity, "unitPrice", "totalPrice", "createdAt", "updatedAt", "discountValue", "currencyUnit", "appliedVoucherId") FROM stdin;
1	1	407	1	209000	209000	2026-04-22 07:46:31.937	2026-04-22 07:46:31.937	0	VND	\N
34	34	402	5	199000	995000	2026-04-22 08:04:55.118	2026-04-22 08:04:55.118	0	VND	\N
35	35	411	3	219000	657000	2026-04-22 08:08:55.676	2026-04-22 08:08:55.676	0	VND	\N
36	36	411	1	219000	219000	2026-04-22 08:10:53.336	2026-04-22 08:10:53.336	0	VND	\N
37	37	411	2	219000	438000	2026-04-22 08:16:05.751	2026-04-22 08:16:05.751	0	VND	\N
38	38	411	4	219000	876000	2026-04-22 08:32:34.638	2026-04-22 08:32:34.638	0	VND	\N
39	39	411	2	219000	438000	2026-04-22 09:13:09.929	2026-04-22 09:13:09.929	0	VND	\N
40	40	501	1	470000	470000	2026-04-22 09:46:48.784	2026-04-22 09:46:48.784	0	VND	\N
41	41	606	1	710000	710000	2026-04-22 09:47:27.322	2026-04-22 09:47:27.322	0	VND	\N
42	42	705	1	155000	155000	2026-04-22 09:50:41.588	2026-04-22 09:50:41.588	0	VND	\N
43	43	456	1	380000	380000	2026-04-22 09:53:36.874	2026-04-22 09:53:36.874	0	VND	\N
44	44	451	1	365000	365000	2026-04-22 09:54:24.098	2026-04-22 09:54:24.098	0	VND	\N
45	45	425	1	239000	239000	2026-04-22 09:56:17.675	2026-04-22 09:56:17.675	0	VND	\N
46	46	410	1	209000	209000	2026-04-24 15:28:33.524	2026-04-24 15:28:33.524	0	VND	\N
\.


--
-- TOC entry 3876 (class 0 OID 17969)
-- Dependencies: 237
-- Data for Name: Orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Orders" (id, "shippingAddressId", "orderDate", status, "subTotal", "shippingFee", discount, "totalAmount", "createdAt", "updatedAt", "userId", "processByStaffId", "currencyUnit", description, "packageChecksumsId", "customerPhone") FROM stdin;
1	5012	2026-04-22 07:46:31.886	DELIVERED	209000	38500	0	247500	2026-04-22 07:46:31.927	2026-04-22 08:02:24.806	11	13	VND	Giao cho bảo vệ tòa nhà nếu người nhận đi vắng	1	0707255821
34	5044	2026-04-22 08:04:54.909	DELIVERED	995000	61600	0	1056600	2026-04-22 08:04:55.095	2026-04-22 08:06:07.099	11	13	VND	Giao cho bảo vệ tòa nhà	34	0707255821
35	5045	2026-04-22 08:08:55.655	CANCELLED	657000	46200	0	703200	2026-04-22 08:08:55.673	2026-04-22 08:10:01.15	11	\N	VND	\N	35	0707255821
36	5046	2026-04-22 08:10:53.319	CANCELLED	219000	38500	0	257500	2026-04-22 08:10:53.334	2026-04-22 08:13:21.801	11	\N	VND	\N	36	0707255821
37	5047	2026-04-22 08:16:05.732	CANCELLED	438000	38500	0	476500	2026-04-22 08:16:05.749	2026-04-22 08:20:00.434	11	\N	VND	\N	37	0707255821
38	5048	2026-04-22 08:32:34.612	CANCELLED	876000	53900	0	929900	2026-04-22 08:32:34.634	2026-04-22 09:05:00.553	11	\N	VND	\N	38	0707255821
39	5049	2026-04-22 09:13:09.908	DELIVERED	438000	38500	0	476500	2026-04-22 09:13:09.925	2026-04-22 09:21:51.157	11	13	VND	\N	39	0707255821
41	5051	2026-04-22 09:47:27.309	SHIPPED	710000	38500	0	748500	2026-04-22 09:47:27.32	2026-04-22 09:48:51.717	11	13	VND	\N	41	0707255821
40	5050	2026-04-22 09:46:48.758	SHIPPED	470000	38500	0	508500	2026-04-22 09:46:48.781	2026-04-22 09:49:02.863	11	13	VND	\N	40	0707255821
44	5054	2026-04-22 09:54:24.075	WAITING_FOR_PICKUP	365000	38500	0	403500	2026-04-22 09:54:24.092	2026-04-22 09:55:25.135	11	13	VND	\N	44	0707255821
43	5053	2026-04-22 09:53:36.844	WAITING_FOR_PICKUP	380000	38500	0	418500	2026-04-22 09:53:36.871	2026-04-22 09:55:30.799	11	13	VND	\N	43	0707255821
45	5055	2026-04-22 09:56:17.657	DELIVERED_FAILED	239000	38500	0	277500	2026-04-22 09:56:17.673	2026-04-22 09:57:30.828	11	13	VND	\N	45	0707255821
42	5052	2026-04-22 09:50:41.568	CANCELLED	155000	38500	0	193500	2026-04-22 09:50:41.586	2026-04-22 10:10:00.053	11	\N	VND	\N	42	0707255821
46	5056	2026-04-24 15:28:33.45	PAYMENT_CONFIRMED	209000	38500	0	247500	2026-04-24 15:28:33.502	2026-04-24 15:28:33.502	11	\N	VND	\N	46	0707255821
\.


--
-- TOC entry 3878 (class 0 OID 17977)
-- Dependencies: 239
-- Data for Name: PackageChecksums; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PackageChecksums" (id, "ghnShopId", "shopId", "checksumData", "createdAt", "updatedAt", "expiredAt", "isUsed", "userId") FROM stdin;
1	199348	\N	b83ca61db46f9bf6a9e7f6ec97957bc506782fdfe6d5ac22e003cf26596e95961b5048d537a821a3d405efe55755d2cb4e67367d066a067bc6a951c3343a661f	2026-04-22 07:45:55.281	2026-04-22 07:46:31.893	2026-04-22 08:00:55.28	t	11
34	199348	\N	5735df741295526a8e55acf800f5987456537532aae74d281155e2b4d465f03941778b28239169ef0022924aadbb22a834eeddaee4ded3c69d355a2e80b24f9e	2026-04-22 08:04:01.137	2026-04-22 08:04:54.915	2026-04-22 08:19:01.118	t	11
35	199348	\N	eda25bfb1eea37f34de1206873d58f4d34045addd559926661a6659f7e8e686e541d09bb1ecc91c01075984b089e63bfa925e541668b7c8f0f2db795b6dd9ae9	2026-04-22 08:08:46.034	2026-04-22 08:10:01.097	2026-04-22 08:23:46.033	f	11
36	199348	\N	b31c6e41cadaeaf2e897f0b979bab956838afcd3ac9ac6ff71c892c32beb6dfde45377bc0def88ae2935e585b37727a010c390e48fc9e1ad5098bc6d418822cb	2026-04-22 08:10:44.916	2026-04-22 08:13:21.791	2026-04-22 08:25:44.915	f	11
37	199348	\N	e1a1844a03e0f97c54fd59d699179162fe049a599b5902080ab06bf07b7df33d12da5f85f8fa0dc6d62b0639930a9f6fdab691cfed7e68c04cceec92ada82bbc	2026-04-22 08:15:56.958	2026-04-22 08:20:00.405	2026-04-22 08:30:56.957	f	11
38	199348	\N	7f73ca28151f87cc920a4fe6d3435c8bdf598e8894df94d14585d50b4e280ea9265f7bb4a9c3e3f4d3d4d73b19116aec46491681cb56e04a95ddf3ec8a25adfa	2026-04-22 08:32:24.976	2026-04-22 09:05:00.534	2026-04-22 08:47:24.974	f	11
39	199348	\N	e1a1844a03e0f97c54fd59d699179162fe049a599b5902080ab06bf07b7df33d12da5f85f8fa0dc6d62b0639930a9f6fdab691cfed7e68c04cceec92ada82bbc	2026-04-22 09:13:01.529	2026-04-22 09:13:09.915	2026-04-22 09:28:01.527	t	11
40	199348	\N	008b9c172127f8bbbd006c82a7828298ac6cfa7e576ad84f87a76e5c91492563f3f6cc058607822c914d883fe4d2395a1e2bfb7be32737de6199b07410f058b5	2026-04-22 09:46:30.977	2026-04-22 09:46:48.765	2026-04-22 10:01:30.976	t	11
41	199348	\N	d014cd23c88f6bec29f0f384c22fb89b8f24300e7136f345626dc13dc48b9760c8c03c6b94bda4138f9c2e643f5a9e6b850feb5bc5322de5cc63f337d61200e9	2026-04-22 09:47:19.961	2026-04-22 09:47:27.313	2026-04-22 10:02:19.96	t	11
43	199348	\N	77abe8177024c2046c8c9b2bd226d3bb26a0f3608306c369198b3cf1f1a0bbf0e478336da525a0fd2755ba78749e2880e3b2e77828df71d9f613d8cbafd9a02d	2026-04-22 09:53:29.755	2026-04-22 09:53:36.852	2026-04-22 10:08:29.754	t	11
44	199348	\N	8e608d2e829c6837940c3d7654389000476a966d68ea471cd8097c2cc0f86b14ed2a4dc762f85976fe5665141404d58fc94f56b17ac67a48188b0a522f7a23fb	2026-04-22 09:54:10.968	2026-04-22 09:54:24.083	2026-04-22 10:09:10.967	t	11
45	199348	\N	71dbcac164eb7cbb327af3322527bce9e62198277dd3bc82fd081006d93513b20eb07524828eeaae2c13445457796eda45d78c16524e133f277b4de5422f224c	2026-04-22 09:56:06.653	2026-04-22 09:56:17.661	2026-04-22 10:11:06.652	t	11
42	199348	\N	7f25c3d1f18766db00c8d4071d5b6e9f4797e898cce030a738085c101e028ee1cfc10ea1df58e991ef619da61ec4e606f73234a472c0a2074c1ac99e67cc0580	2026-04-22 09:50:36.036	2026-04-22 10:10:00.04	2026-04-22 10:05:36.035	f	11
46	199348	\N	3187cabf656ffc57f38cfb952a9b210ff06bf07fbe5518988c2509895cc24b9612f738f5d838fa627e7c9d5af882bd024be5c2fe8e9da2cccb712eb5832ea9d6	2026-04-24 15:28:25.997	2026-04-24 15:28:33.466	2026-04-24 15:43:25.992	t	11
\.


--
-- TOC entry 3880 (class 0 OID 17985)
-- Dependencies: 241
-- Data for Name: Payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payments" (id, "orderId", "transactionId", "paymentDate", amount, status, "paymentMethod", "currencyUnit", "createdAt", "updatedAt", "vnp_ExpireDate", "vnp_CreateDate") FROM stdin;
1	1	1776843991942-1-11-5147383	2026-04-22 08:02:24.802	247500	PAID	COD	VND	2026-04-22 07:46:31.945	2026-04-22 08:02:24.803	\N	\N
34	34	1776845095180-34-11-5229373	2026-04-22 08:06:07.091	1056600	PAID	COD	VND	2026-04-22 08:04:55.208	2026-04-22 08:06:07.093	\N	\N
35	35	1776845335680-35-11-4379695	2026-04-22 08:08:55.681	703200	CANCELLED	VNPAY	VND	2026-04-22 08:08:55.681	2026-04-22 08:10:01.171	20260422082356	20260422080856
36	36	1776845453337-36-11-1634901	2026-04-22 08:10:53.338	257500	CANCELLED	VNPAY	VND	2026-04-22 08:10:53.338	2026-04-22 08:13:21.806	20260422082554	20260422081054
37	37	1776845765756-37-11-2657840	2026-04-22 08:16:05.757	476500	CANCELLED	VNPAY	VND	2026-04-22 08:16:05.757	2026-04-22 08:20:00.451	20260422083106	20260422081606
38	38	1776846754641-38-11-5991909	2026-04-22 08:32:34.644	929900	CANCELLED	VNPAY	VND	2026-04-22 08:32:34.644	2026-04-22 09:05:00.562	20260422084735	20260422083235
39	39	15508669	2026-04-22 09:19:35	476500	PAID	VNPAY	VND	2026-04-22 09:13:09.935	2026-04-22 09:19:45.656	20260422162811	20260422161311
40	40	1776851208786-40-11-2386832	2026-04-22 09:46:48.787	508500	PENDING	COD	VND	2026-04-22 09:46:48.787	2026-04-22 09:46:48.787	\N	\N
41	41	15508744	2026-04-22 09:47:57	748500	PAID	VNPAY	VND	2026-04-22 09:47:27.327	2026-04-22 09:48:01.903	20260422170228	20260422164728
43	43	1776851616876-43-11-4973245	2026-04-22 09:53:36.877	418500	PENDING	COD	VND	2026-04-22 09:53:36.877	2026-04-22 09:53:36.877	\N	\N
44	44	15508760	2026-04-22 09:54:54	403500	PAID	VNPAY	VND	2026-04-22 09:54:24.101	2026-04-22 09:54:59.209	20260422170925	20260422165425
45	45	15508768	2026-04-22 09:56:53	277500	PAID	VNPAY	VND	2026-04-22 09:56:17.678	2026-04-22 09:56:59.565	20260422171118	20260422165618
42	42	1776851441591-42-11-4833808	2026-04-22 09:50:41.593	193500	CANCELLED	VNPAY	VND	2026-04-22 09:50:41.593	2026-04-22 10:10:00.061	20260422170543	20260422165043
46	46	1777044513537-46-11-7576247	2026-04-24 15:28:33.541	247500	PENDING	COD	VND	2026-04-24 15:28:33.541	2026-04-24 15:28:33.541	\N	\N
\.


--
-- TOC entry 3882 (class 0 OID 17994)
-- Dependencies: 243
-- Data for Name: ProductVariants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductVariants" (id, "productId", "variantName", "variantColor", "variantSize", price, stock, "stockKeepingUnit", "createdAt", "updatedAt", "createByUserId", "voucherId", "colorId", "variantHeight", "variantLength", "variantWeight", "variantWidth", "currencyUnit", "isNewProductVariant", "soldQuantity") FROM stdin;
1001	92	Owen Sơ Mi Trắng Công Sở	Xanh Navy	S	0	0	PV-92-V105	2026-04-17 04:27:47.898	2026-04-17 04:27:47.898	13	\N	4	5	25	250	20	VND	t	0
1003	92	Owen Sơ Mi Trắng Công Sở	Xanh Rêu	S	0	0	PV-92-V108	2026-04-17 04:27:47.918	2026-04-17 04:27:47.918	13	\N	7	5	25	250	20	VND	t	0
1005	92	Owen Sơ Mi Trắng Công Sở	Xám Khói	M	0	0	PV-92-V110	2026-04-17 04:27:47.961	2026-04-17 04:27:47.961	13	\N	5	5	25	250	20	VND	t	0
1007	92	Owen Sơ Mi Trắng Công Sở	Xanh Rêu	M	0	0	PV-92-V112	2026-04-17 04:27:48.765	2026-04-17 04:27:48.765	13	\N	7	5	25	250	20	VND	t	0
1008	92	Owen Sơ Mi Trắng Công Sở	Đỏ Đô	L	0	0	PV-92-V113	2026-04-17 04:27:48.777	2026-04-17 04:27:48.777	13	\N	3	5	25	250	20	VND	t	0
1013	92	Owen Sơ Mi Trắng Công Sở	Đỏ Đô	XL	0	0	PV-92-V117	2026-04-17 04:27:49.47	2026-04-17 04:27:49.47	13	\N	3	5	25	250	20	VND	t	0
1015	92	Owen Sơ Mi Trắng Công Sở	Xám Khói	XL	0	0	PV-92-V119	2026-04-17 04:27:49.517	2026-04-17 04:27:49.517	13	\N	5	5	25	250	20	VND	t	0
403	82	Coolmate Áo Thun Cotton Compact	Xám Khói	L	199000	100	SKU-3-1-VAR3	2026-04-16 03:21:41.99	2026-04-16 11:51:12.002	1	\N	5	5	25	350	18	VND	t	0
404	82	Coolmate Áo Thun Cotton Compact	Be (Cream)	XL	199000	100	SKU-3-1-VAR4	2026-04-16 03:21:41.99	2026-04-16 11:51:14.084	1	\N	6	5	25	350	18	VND	t	0
405	82	Coolmate Áo Thun Cotton Compact	Xanh Rêu	XXL	199000	100	SKU-3-1-VAR5	2026-04-16 03:21:41.99	2026-04-16 11:51:14.793	1	\N	7	5	25	350	18	VND	t	0
412	84	Levents Áo Thun Oversize Graphic	Be (Cream)	M	219000	100	SKU-3-3-VAR2	2026-04-16 03:21:41.99	2026-04-17 00:43:35.602	1	\N	6	5	25	350	18	VND	t	0
413	84	Levents Áo Thun Oversize Graphic	Xanh Rêu	L	219000	100	SKU-3-3-VAR3	2026-04-16 03:21:41.99	2026-04-17 00:43:36.816	1	\N	7	5	25	350	18	VND	t	0
414	84	Levents Áo Thun Oversize Graphic	Hồng Pastel	XL	219000	100	SKU-3-3-VAR4	2026-04-16 03:21:41.99	2026-04-17 00:43:37.632	1	\N	8	5	25	350	18	VND	t	0
415	84	Levents Áo Thun Oversize Graphic	Nâu Đất	XXL	219000	100	SKU-3-3-VAR5	2026-04-16 03:21:41.99	2026-04-17 00:43:39.382	1	\N	9	5	25	350	18	VND	t	0
416	85	DirtyCoins Áo Polo Pique Pro	Be (Cream)	S	229000	100	SKU-3-4-VAR1	2026-04-16 03:21:41.99	2026-04-17 00:46:41.526	1	\N	6	5	25	350	18	VND	t	0
417	85	DirtyCoins Áo Polo Pique Pro	Xanh Rêu	M	229000	100	SKU-3-4-VAR2	2026-04-16 03:21:41.99	2026-04-17 00:46:50.43	1	\N	7	5	25	350	18	VND	t	0
418	85	DirtyCoins Áo Polo Pique Pro	Hồng Pastel	L	229000	100	SKU-3-4-VAR3	2026-04-16 03:21:41.99	2026-04-17 00:46:50.645	1	\N	8	5	25	350	18	VND	t	0
419	85	DirtyCoins Áo Polo Pique Pro	Nâu Đất	XL	229000	100	SKU-3-4-VAR4	2026-04-16 03:21:41.99	2026-04-17 00:46:51.166	1	\N	9	5	25	350	18	VND	t	0
420	85	DirtyCoins Áo Polo Pique Pro	Vàng Mù Tạt	XXL	229000	100	SKU-3-4-VAR5	2026-04-16 03:21:41.99	2026-04-17 00:46:51.359	1	\N	10	5	25	350	18	VND	t	0
421	86	SSStutter Áo Thun Basic Tee	Xanh Rêu	S	239000	100	SKU-3-5-VAR1	2026-04-16 03:21:41.99	2026-04-17 00:55:58.497	1	\N	7	5	25	350	18	VND	t	0
422	86	SSStutter Áo Thun Basic Tee	Hồng Pastel	M	239000	100	SKU-3-5-VAR2	2026-04-16 03:21:41.99	2026-04-17 00:56:07.16	1	\N	8	5	25	350	18	VND	t	0
423	86	SSStutter Áo Thun Basic Tee	Nâu Đất	L	239000	100	SKU-3-5-VAR3	2026-04-16 03:21:41.99	2026-04-17 00:56:07.794	1	\N	9	5	25	350	18	VND	t	0
424	86	SSStutter Áo Thun Basic Tee	Vàng Mù Tạt	XL	239000	100	SKU-3-5-VAR4	2026-04-16 03:21:41.99	2026-04-17 00:56:08.292	1	\N	10	5	25	350	18	VND	t	0
426	87	Outerity Áo Thun Local Brand	Hồng Pastel	S	249000	100	SKU-3-6-VAR1	2026-04-16 03:21:41.99	2026-04-17 00:58:03.029	1	\N	8	5	25	350	18	VND	t	0
427	87	Outerity Áo Thun Local Brand	Nâu Đất	M	249000	100	SKU-3-6-VAR2	2026-04-16 03:21:41.99	2026-04-17 00:58:11.273	1	\N	9	5	25	350	18	VND	t	0
428	87	Outerity Áo Thun Local Brand	Vàng Mù Tạt	L	249000	100	SKU-3-6-VAR3	2026-04-16 03:21:41.99	2026-04-17 00:58:11.527	1	\N	10	5	25	350	18	VND	t	0
429	87	Outerity Áo Thun Local Brand	Đen Tuyền	XL	249000	100	SKU-3-6-VAR4	2026-04-16 03:21:41.99	2026-04-17 00:58:11.594	1	\N	1	5	25	350	18	VND	t	0
430	87	Outerity Áo Thun Local Brand	Trắng Basic	XXL	249000	100	SKU-3-6-VAR5	2026-04-16 03:21:41.99	2026-04-17 00:58:12.079	1	\N	2	5	25	350	18	VND	t	0
1016	92	Owen Sơ Mi Trắng Công Sở	Xanh Rêu	XL	0	0	PV-92-V120	2026-04-17 04:27:49.66	2026-04-17 04:27:49.66	13	\N	7	5	25	250	20	VND	t	0
1017	92	Owen Sơ Mi Trắng Công Sở	Đỏ Đô	XXL	0	0	PV-92-V121	2026-04-17 04:27:49.757	2026-04-17 04:27:49.757	13	\N	3	5	25	250	20	VND	t	0
1018	92	Owen Sơ Mi Trắng Công Sở	Xanh Navy	XXL	0	0	PV-92-V122	2026-04-17 04:27:49.886	2026-04-17 04:27:49.886	13	\N	4	5	25	250	20	VND	t	0
1019	92	Owen Sơ Mi Trắng Công Sở	Xám Khói	XXL	0	0	PV-92-V123	2026-04-17 04:27:49.952	2026-04-17 04:27:49.952	13	\N	5	5	25	250	20	VND	t	0
1002	92	Owen Sơ Mi Trắng Công Sở	Be (Cream)	S	0	0	PV-92-V107	2026-04-17 04:27:47.905	2026-04-17 04:27:47.905	13	\N	6	5	25	250	20	VND	t	0
402	82	Coolmate Áo Thun Cotton Compact	Xanh Navy	M	199000	95	SKU-3-1-VAR2	2026-04-16 03:21:41.99	2026-04-22 08:04:54.937	1	\N	4	5	25	350	18	VND	t	5
411	84	Levents Áo Thun Oversize Graphic	Xám Khói	S	219000	98	SKU-3-3-VAR1	2026-04-16 03:21:41.99	2026-04-22 09:13:09.919	1	\N	5	5	25	350	18	VND	t	2
501	102	Routine Quần Jean Slim Fit	Đỏ Đô	38	470000	99	SKU-5-1-VAR1	2026-04-16 03:21:41.99	2026-04-22 09:46:48.768	1	\N	3	5	25	350	18	VND	t	1
410	83	Routine Áo Polo Excool	Hồng Pastel	XXL	209000	99	SKU-3-2-VAR5	2026-04-16 03:21:41.99	2026-04-24 15:28:33.483	1	\N	8	5	25	350	18	VND	t	1
1004	92	Owen Sơ Mi Trắng Công Sở	Đỏ Đô	M	0	0	PV-92-V109	2026-04-17 04:27:47.922	2026-04-17 04:27:47.922	13	\N	3	5	25	250	20	VND	t	0
452	92	Owen Sơ Mi Trắng Công Sở	Xanh Navy	M	365000	100	SKU-4-1-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:27:50.092	1	\N	4	5	25	350	18	VND	t	0
453	92	Owen Sơ Mi Trắng Công Sở	Xám Khói	L	365000	100	SKU-4-1-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:27:50.155	1	\N	5	5	25	350	18	VND	t	0
454	92	Owen Sơ Mi Trắng Công Sở	Be (Cream)	XL	365000	100	SKU-4-1-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:27:50.204	1	\N	6	5	25	350	18	VND	t	0
455	92	Owen Sơ Mi Trắng Công Sở	Xanh Rêu	XXL	365000	100	SKU-4-1-VAR5	2026-04-16 03:21:41.99	2026-04-17 04:27:50.251	1	\N	7	5	25	350	18	VND	t	0
457	93	Aristino Sơ Mi Flannel Kẻ Caro	Xám Khói	M	380000	100	SKU-4-2-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:29:04.148	1	\N	5	5	25	350	18	VND	t	0
458	93	Aristino Sơ Mi Flannel Kẻ Caro	Be (Cream)	L	380000	100	SKU-4-2-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:29:04.755	1	\N	6	5	25	350	18	VND	t	0
459	93	Aristino Sơ Mi Flannel Kẻ Caro	Xanh Rêu	XL	380000	100	SKU-4-2-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:29:05.085	1	\N	7	5	25	350	18	VND	t	0
460	93	Aristino Sơ Mi Flannel Kẻ Caro	Hồng Pastel	XXL	380000	100	SKU-4-2-VAR5	2026-04-16 03:21:41.99	2026-04-17 04:29:05.866	1	\N	8	5	25	350	18	VND	t	0
1042	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Hồng Pastel	S	0	0	PV-94-V107	2026-04-17 04:30:02.118	2026-04-17 04:30:02.118	13	\N	8	5	25	250	20	VND	t	0
1044	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Xám Khói	M	0	0	PV-94-V109	2026-04-17 04:30:02.135	2026-04-17 04:30:02.135	13	\N	5	5	25	250	20	VND	t	0
461	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Xám Khói	S	395000	100	SKU-4-3-VAR1	2026-04-16 03:21:41.99	2026-04-17 04:30:02.142	1	\N	5	5	25	350	18	VND	t	0
1048	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Nâu Đất	M	0	0	PV-94-V112	2026-04-17 04:30:02.761	2026-04-17 04:30:02.761	13	\N	9	5	25	250	20	VND	t	0
1049	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Xám Khói	L	0	0	PV-94-V113	2026-04-17 04:30:02.775	2026-04-17 04:30:02.775	13	\N	5	5	25	250	20	VND	t	0
462	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Be (Cream)	M	395000	100	SKU-4-3-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:30:03.517	1	\N	6	5	25	350	18	VND	t	0
463	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Xanh Rêu	L	395000	100	SKU-4-3-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:30:03.904	1	\N	7	5	25	350	18	VND	t	0
464	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Hồng Pastel	XL	395000	100	SKU-4-3-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:30:03.907	1	\N	8	5	25	350	18	VND	t	0
465	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Nâu Đất	XXL	395000	100	SKU-4-3-VAR5	2026-04-16 03:21:41.99	2026-04-17 04:30:04.146	1	\N	9	5	25	350	18	VND	t	0
1125	112	Owen Quần Tây Slim Fit	Đỏ Đô	39	0	0	PV-112-V109	2026-04-17 04:34:44.373	2026-04-17 04:34:44.373	13	\N	3	5	25	250	20	VND	t	0
1126	112	Owen Quần Tây Slim Fit	Xám Khói	39	0	0	PV-112-V110	2026-04-17 04:34:44.858	2026-04-17 04:34:44.858	13	\N	5	5	25	250	20	VND	t	0
1128	112	Owen Quần Tây Slim Fit	Xanh Rêu	39	0	0	PV-112-V112	2026-04-17 04:34:44.951	2026-04-17 04:34:44.951	13	\N	7	5	25	250	20	VND	t	0
1129	112	Owen Quần Tây Slim Fit	Đỏ Đô	40	0	0	PV-112-V113	2026-04-17 04:34:45.169	2026-04-17 04:34:45.169	13	\N	3	5	25	250	20	VND	t	0
1130	112	Owen Quần Tây Slim Fit	Xanh Navy	40	0	0	PV-112-V114	2026-04-17 04:34:45.258	2026-04-17 04:34:45.258	13	\N	4	5	25	250	20	VND	t	0
1131	112	Owen Quần Tây Slim Fit	Be (Cream)	40	0	0	PV-112-V115	2026-04-17 04:34:45.337	2026-04-17 04:34:45.337	13	\N	6	5	25	250	20	VND	t	0
1142	113	Aristino Quần Kaki Chino Basic	Xanh Rêu	38	0	0	PV-113-V107	2026-04-17 04:35:25.812	2026-04-17 04:35:25.812	13	\N	7	5	25	250	20	VND	t	0
1144	113	Aristino Quần Kaki Chino Basic	Hồng Pastel	38	0	0	PV-113-V108	2026-04-17 04:35:25.824	2026-04-17 04:35:25.824	13	\N	8	5	25	250	20	VND	t	0
1151	113	Aristino Quần Kaki Chino Basic	Xanh Rêu	40	0	0	PV-113-V115	2026-04-17 04:35:26.454	2026-04-17 04:35:26.454	13	\N	7	5	25	250	20	VND	t	0
1156	113	Aristino Quần Kaki Chino Basic	Hồng Pastel	41	0	0	PV-113-V120	2026-04-17 04:35:26.803	2026-04-17 04:35:26.803	13	\N	8	5	25	250	20	VND	t	0
1157	113	Aristino Quần Kaki Chino Basic	Xanh Navy	42	0	0	PV-113-V121	2026-04-17 04:35:26.823	2026-04-17 04:35:26.823	13	\N	4	5	25	250	20	VND	t	0
1158	113	Aristino Quần Kaki Chino Basic	Xám Khói	42	0	0	PV-113-V122	2026-04-17 04:35:26.874	2026-04-17 04:35:26.874	13	\N	5	5	25	250	20	VND	t	0
1160	113	Aristino Quần Kaki Chino Basic	Xanh Rêu	42	0	0	PV-113-V124	2026-04-17 04:35:26.987	2026-04-17 04:35:26.987	13	\N	7	5	25	250	20	VND	t	0
1282	136	Zapatos Giày Chelsea Boots	Vàng Mù Tạt	S	0	0	PV-136-V107	2026-04-17 04:45:38.677	2026-04-17 04:45:38.677	13	\N	10	5	25	250	20	VND	t	0
1319	142	MLB Nón Kết NY Yankees	Xám Khói	XXL	0	0	PV-142-V123	2026-04-17 04:47:33.474	2026-04-17 04:47:33.474	13	\N	5	5	25	250	20	VND	t	0
1347	168	Outerity Áo Sweater Nỉ Bông	Trắng Basic	M	0	0	PV-168-V111	2026-04-17 04:50:41.045	2026-04-17 04:50:41.045	13	\N	2	5	25	250	20	VND	t	0
1348	168	Outerity Áo Sweater Nỉ Bông	Đỏ Đô	M	0	0	PV-168-V112	2026-04-17 04:50:41.081	2026-04-17 04:50:41.081	13	\N	3	5	25	250	20	VND	t	0
1006	92	Owen Sơ Mi Trắng Công Sở	Be (Cream)	M	0	0	PV-92-V111	2026-04-17 04:27:48.76	2026-04-17 04:27:48.76	13	\N	6	5	25	250	20	VND	t	0
1009	92	Owen Sơ Mi Trắng Công Sở	Xám Khói	S	0	0	PV-92-V106	2026-04-17 04:27:48.782	2026-04-17 04:27:48.782	13	\N	5	5	25	250	20	VND	t	0
451	92	Owen Sơ Mi Trắng Công Sở	Đỏ Đô	S	365000	99	SKU-4-1-VAR1	2026-04-16 03:21:41.99	2026-04-22 09:54:24.085	1	\N	3	5	25	350	18	VND	t	1
1010	92	Owen Sơ Mi Trắng Công Sở	Xanh Navy	L	0	0	PV-92-V114	2026-04-17 04:27:49.097	2026-04-17 04:27:49.097	13	\N	4	5	25	250	20	VND	t	0
1011	92	Owen Sơ Mi Trắng Công Sở	Be (Cream)	L	0	0	PV-92-V115	2026-04-17 04:27:49.341	2026-04-17 04:27:49.341	13	\N	6	5	25	250	20	VND	t	0
1012	92	Owen Sơ Mi Trắng Công Sở	Xanh Rêu	L	0	0	PV-92-V116	2026-04-17 04:27:49.421	2026-04-17 04:27:49.421	13	\N	7	5	25	250	20	VND	t	0
1014	92	Owen Sơ Mi Trắng Công Sở	Xanh Navy	XL	0	0	PV-92-V118	2026-04-17 04:27:49.48	2026-04-17 04:27:49.48	13	\N	4	5	25	250	20	VND	t	0
1021	93	Aristino Sơ Mi Flannel Kẻ Caro	Xanh Rêu	S	0	0	PV-93-V107	2026-04-17 04:29:01.68	2026-04-17 04:29:01.68	13	\N	7	5	25	250	20	VND	t	0
1022	93	Aristino Sơ Mi Flannel Kẻ Caro	Be (Cream)	S	0	0	PV-93-V106	2026-04-17 04:29:01.697	2026-04-17 04:29:01.697	13	\N	6	5	25	250	20	VND	t	0
1023	93	Aristino Sơ Mi Flannel Kẻ Caro	Hồng Pastel	S	0	0	PV-93-V108	2026-04-17 04:29:01.704	2026-04-17 04:29:01.704	13	\N	8	5	25	250	20	VND	t	0
1024	93	Aristino Sơ Mi Flannel Kẻ Caro	Xám Khói	S	0	0	PV-93-V105	2026-04-17 04:29:01.715	2026-04-17 04:29:01.715	13	\N	5	5	25	250	20	VND	t	0
1030	93	Aristino Sơ Mi Flannel Kẻ Caro	Xám Khói	L	0	0	PV-93-V114	2026-04-17 04:29:02.532	2026-04-17 04:29:02.532	13	\N	5	5	25	250	20	VND	t	0
1033	93	Aristino Sơ Mi Flannel Kẻ Caro	Xanh Navy	XL	0	0	PV-93-V117	2026-04-17 04:29:02.942	2026-04-17 04:29:02.942	13	\N	4	5	25	250	20	VND	t	0
1034	93	Aristino Sơ Mi Flannel Kẻ Caro	Xám Khói	XL	0	0	PV-93-V118	2026-04-17 04:29:02.981	2026-04-17 04:29:02.981	13	\N	5	5	25	250	20	VND	t	0
1035	93	Aristino Sơ Mi Flannel Kẻ Caro	Be (Cream)	XL	0	0	PV-93-V119	2026-04-17 04:29:03.256	2026-04-17 04:29:03.256	13	\N	6	5	25	250	20	VND	t	0
1037	93	Aristino Sơ Mi Flannel Kẻ Caro	Xanh Navy	XXL	0	0	PV-93-V121	2026-04-17 04:29:03.327	2026-04-17 04:29:03.327	13	\N	4	5	25	250	20	VND	t	0
1038	93	Aristino Sơ Mi Flannel Kẻ Caro	Xám Khói	XXL	0	0	PV-93-V122	2026-04-17 04:29:03.846	2026-04-17 04:29:03.846	13	\N	5	5	25	250	20	VND	t	0
1039	93	Aristino Sơ Mi Flannel Kẻ Caro	Be (Cream)	XXL	0	0	PV-93-V123	2026-04-17 04:29:03.872	2026-04-17 04:29:03.872	13	\N	6	5	25	250	20	VND	t	0
1040	93	Aristino Sơ Mi Flannel Kẻ Caro	Xanh Rêu	XXL	0	0	PV-93-V124	2026-04-17 04:29:03.938	2026-04-17 04:29:03.938	13	\N	7	5	25	250	20	VND	t	0
502	102	Routine Quần Jean Slim Fit	Xanh Navy	39	470000	100	SKU-5-1-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:31:28.1	1	\N	4	5	25	350	18	VND	t	0
1140	112	Owen Quần Tây Slim Fit	Be (Cream)	42	0	0	PV-112-V124	2026-04-17 04:34:45.877	2026-04-17 04:34:45.877	13	\N	6	5	25	250	20	VND	t	0
1290	136	Zapatos Giày Chelsea Boots	Hồng Pastel	L	0	0	PV-136-V114	2026-04-17 04:45:40.362	2026-04-17 04:45:40.362	13	\N	8	5	25	250	20	VND	t	0
1291	136	Zapatos Giày Chelsea Boots	Vàng Mù Tạt	L	0	0	PV-136-V115	2026-04-17 04:45:40.542	2026-04-17 04:45:40.542	13	\N	10	5	25	250	20	VND	t	0
1292	136	Zapatos Giày Chelsea Boots	Đen Tuyền	L	0	0	PV-136-V116	2026-04-17 04:45:40.822	2026-04-17 04:45:40.822	13	\N	1	5	25	250	20	VND	t	0
1293	136	Zapatos Giày Chelsea Boots	Xanh Rêu	XL	0	0	PV-136-V117	2026-04-17 04:45:41.611	2026-04-17 04:45:41.611	13	\N	7	5	25	250	20	VND	t	0
1294	136	Zapatos Giày Chelsea Boots	Hồng Pastel	XL	0	0	PV-136-V118	2026-04-17 04:45:41.68	2026-04-17 04:45:41.68	13	\N	8	5	25	250	20	VND	t	0
1295	136	Zapatos Giày Chelsea Boots	Nâu Đất	XL	0	0	PV-136-V119	2026-04-17 04:45:41.832	2026-04-17 04:45:41.832	13	\N	9	5	25	250	20	VND	t	0
1296	136	Zapatos Giày Chelsea Boots	Đen Tuyền	XL	0	0	PV-136-V120	2026-04-17 04:45:42.225	2026-04-17 04:45:42.225	13	\N	1	5	25	250	20	VND	t	0
1297	136	Zapatos Giày Chelsea Boots	Xanh Rêu	XXL	0	0	PV-136-V121	2026-04-17 04:45:42.418	2026-04-17 04:45:42.418	13	\N	7	5	25	250	20	VND	t	0
1298	136	Zapatos Giày Chelsea Boots	Hồng Pastel	XXL	0	0	PV-136-V122	2026-04-17 04:45:42.469	2026-04-17 04:45:42.469	13	\N	8	5	25	250	20	VND	t	0
1299	136	Zapatos Giày Chelsea Boots	Nâu Đất	XXL	0	0	PV-136-V123	2026-04-17 04:45:42.702	2026-04-17 04:45:42.702	13	\N	9	5	25	250	20	VND	t	0
672	136	Zapatos Giày Chelsea Boots	Hồng Pastel	M	1100000	100	SKU-8-5-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:45:43.229	1	\N	8	5	25	350	18	VND	t	0
1300	136	Zapatos Giày Chelsea Boots	Vàng Mù Tạt	XXL	0	0	PV-136-V124	2026-04-17 04:45:43.308	2026-04-17 04:45:43.308	13	\N	10	5	25	250	20	VND	t	0
1349	168	Outerity Áo Sweater Nỉ Bông	Nâu Đất	L	0	0	PV-168-V113	2026-04-17 04:50:41.283	2026-04-17 04:50:41.283	13	\N	9	5	25	250	20	VND	t	0
1350	168	Outerity Áo Sweater Nỉ Bông	Vàng Mù Tạt	L	0	0	PV-168-V114	2026-04-17 04:50:41.36	2026-04-17 04:50:41.36	13	\N	10	5	25	250	20	VND	t	0
1351	168	Outerity Áo Sweater Nỉ Bông	Trắng Basic	L	0	0	PV-168-V115	2026-04-17 04:50:41.485	2026-04-17 04:50:41.485	13	\N	2	5	25	250	20	VND	t	0
1352	168	Outerity Áo Sweater Nỉ Bông	Đỏ Đô	L	0	0	PV-168-V116	2026-04-17 04:50:41.806	2026-04-17 04:50:41.806	13	\N	3	5	25	250	20	VND	t	0
1353	168	Outerity Áo Sweater Nỉ Bông	Nâu Đất	XL	0	0	PV-168-V117	2026-04-17 04:50:41.916	2026-04-17 04:50:41.916	13	\N	9	5	25	250	20	VND	t	0
1354	168	Outerity Áo Sweater Nỉ Bông	Vàng Mù Tạt	XL	0	0	PV-168-V118	2026-04-17 04:50:42.134	2026-04-17 04:50:42.134	13	\N	10	5	25	250	20	VND	t	0
1020	92	Owen Sơ Mi Trắng Công Sở	Be (Cream)	XXL	0	0	PV-92-V124	2026-04-17 04:27:50.016	2026-04-17 04:27:50.016	13	\N	6	5	25	250	20	VND	t	0
503	102	Routine Quần Jean Slim Fit	Xám Khói	40	470000	100	SKU-5-1-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:31:28.228	1	\N	5	5	25	350	18	VND	t	0
504	102	Routine Quần Jean Slim Fit	Be (Cream)	41	470000	100	SKU-5-1-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:31:28.548	1	\N	6	5	25	350	18	VND	t	0
505	102	Routine Quần Jean Slim Fit	Xanh Rêu	42	470000	100	SKU-5-1-VAR5	2026-04-16 03:21:41.99	2026-04-17 04:31:28.552	1	\N	7	5	25	350	18	VND	t	0
511	104	Copper Denim Quần Jean Baggy Nam	Xám Khói	38	510000	100	SKU-5-3-VAR1	2026-04-16 03:21:41.99	2026-04-17 04:32:10.252	1	\N	5	5	25	350	18	VND	t	0
512	104	Copper Denim Quần Jean Baggy Nam	Be (Cream)	39	510000	100	SKU-5-3-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:32:16.576	1	\N	6	5	25	350	18	VND	t	0
513	104	Copper Denim Quần Jean Baggy Nam	Xanh Rêu	40	510000	100	SKU-5-3-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:32:16.716	1	\N	7	5	25	350	18	VND	t	0
514	104	Copper Denim Quần Jean Baggy Nam	Hồng Pastel	41	510000	100	SKU-5-3-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:32:17.113	1	\N	8	5	25	350	18	VND	t	0
515	104	Copper Denim Quần Jean Baggy Nam	Nâu Đất	42	510000	100	SKU-5-3-VAR5	2026-04-16 03:21:41.99	2026-04-17 04:32:17.171	1	\N	9	5	25	350	18	VND	t	0
521	106	DirtyCoins Quần Jean Rách Gối	Xanh Rêu	38	550000	100	SKU-5-5-VAR1	2026-04-16 03:21:41.99	2026-04-17 04:33:32.957	1	\N	7	5	25	350	18	VND	t	0
522	106	DirtyCoins Quần Jean Rách Gối	Hồng Pastel	39	550000	100	SKU-5-5-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:33:39.271	1	\N	8	5	25	350	18	VND	t	0
523	106	DirtyCoins Quần Jean Rách Gối	Nâu Đất	40	550000	100	SKU-5-5-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:33:39.276	1	\N	9	5	25	350	18	VND	t	0
524	106	DirtyCoins Quần Jean Rách Gối	Vàng Mù Tạt	41	550000	100	SKU-5-5-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:33:39.414	1	\N	10	5	25	350	18	VND	t	0
525	106	DirtyCoins Quần Jean Rách Gối	Đen Tuyền	42	550000	100	SKU-5-5-VAR5	2026-04-16 03:21:41.99	2026-04-17 04:33:39.496	1	\N	1	5	25	350	18	VND	t	0
406	83	Routine Áo Polo Excool	Xanh Navy	S	209000	100	SKU-3-2-VAR1	2026-04-16 03:21:41.99	2026-04-17 04:35:56.445	1	\N	4	5	25	350	18	VND	t	0
1161	83	Routine Áo Polo Excool	Xám Khói	S	0	0	PV-83-V105	2026-04-17 04:35:56.468	2026-04-17 04:35:56.468	13	\N	5	5	25	250	20	VND	t	0
1167	83	Routine Áo Polo Excool	Be (Cream)	M	0	0	PV-83-V111	2026-04-17 04:35:56.672	2026-04-17 04:35:56.672	13	\N	6	5	25	250	20	VND	t	0
1171	83	Routine Áo Polo Excool	Xám Khói	XXL	0	0	PV-83-V114	2026-04-17 04:35:56.725	2026-04-17 04:35:56.725	13	\N	5	5	25	250	20	VND	t	0
1174	83	Routine Áo Polo Excool	Xám Khói	L	0	0	PV-83-V118	2026-04-17 04:35:56.759	2026-04-17 04:35:56.759	13	\N	5	5	25	250	20	VND	t	0
1175	83	Routine Áo Polo Excool	Hồng Pastel	L	0	0	PV-83-V119	2026-04-17 04:35:56.8	2026-04-17 04:35:56.8	13	\N	8	5	25	250	20	VND	t	0
1177	83	Routine Áo Polo Excool	Xanh Navy	XL	0	0	PV-83-V121	2026-04-17 04:35:56.827	2026-04-17 04:35:56.827	13	\N	4	5	25	250	20	VND	t	0
1179	83	Routine Áo Polo Excool	Hồng Pastel	XL	0	0	PV-83-V123	2026-04-17 04:35:56.844	2026-04-17 04:35:56.844	13	\N	8	5	25	250	20	VND	t	0
409	83	Routine Áo Polo Excool	Xanh Rêu	XL	209000	100	SKU-3-2-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:35:56.923	1	\N	7	5	25	350	18	VND	t	0
1196	114	Routine Quần Tây Âu Lịch Sự	Nâu Đất	41	0	0	PV-114-V120	2026-04-17 04:37:41.869	2026-04-17 04:37:41.869	13	\N	9	5	25	250	20	VND	t	0
1198	114	Routine Quần Tây Âu Lịch Sự	Be (Cream)	42	0	0	PV-114-V122	2026-04-17 04:37:42.141	2026-04-17 04:37:42.141	13	\N	6	5	25	250	20	VND	t	0
1199	114	Routine Quần Tây Âu Lịch Sự	Xanh Rêu	42	0	0	PV-114-V123	2026-04-17 04:37:42.149	2026-04-17 04:37:42.149	13	\N	7	5	25	250	20	VND	t	0
1200	114	Routine Quần Tây Âu Lịch Sự	Hồng Pastel	42	0	0	PV-114-V124	2026-04-17 04:37:42.232	2026-04-17 04:37:42.232	13	\N	8	5	25	250	20	VND	t	0
671	136	Zapatos Giày Chelsea Boots	Xanh Rêu	S	1100000	100	SKU-8-5-VAR1	2026-04-16 03:21:41.99	2026-04-17 04:45:38.681	1	\N	7	5	25	350	18	VND	t	0
1301	142	MLB Nón Kết NY Yankees	Xanh Navy	S	0	0	PV-142-V105	2026-04-17 04:47:28.756	2026-04-17 04:47:28.756	13	\N	4	5	25	250	20	VND	t	0
1303	142	MLB Nón Kết NY Yankees	Xám Khói	S	0	0	PV-142-V106	2026-04-17 04:47:28.774	2026-04-17 04:47:28.774	13	\N	5	5	25	250	20	VND	t	0
1322	166	5theway Áo Hoodie Oversize	Vàng Mù Tạt	S	0	0	PV-166-V107	2026-04-17 04:49:39.982	2026-04-17 04:49:39.982	13	\N	10	5	25	250	20	VND	t	0
1324	166	5theway Áo Hoodie Oversize	Đen Tuyền	S	0	0	PV-166-V108	2026-04-17 04:49:39.997	2026-04-17 04:49:39.997	13	\N	1	5	25	250	20	VND	t	0
1331	166	5theway Áo Hoodie Oversize	Vàng Mù Tạt	L	0	0	PV-166-V115	2026-04-17 04:49:42.642	2026-04-17 04:49:42.642	13	\N	10	5	25	250	20	VND	t	0
1361	152	Leonardo Thắt Lưng Da Miếng	Be (Cream)	S	0	0	PV-152-V107	2026-04-17 04:53:48.153	2026-04-17 04:53:48.153	13	\N	6	5	25	250	20	VND	t	0
1363	152	Leonardo Thắt Lưng Da Miếng	Xanh Rêu	S	0	0	PV-152-V108	2026-04-17 04:53:48.168	2026-04-17 04:53:48.168	13	\N	7	5	25	250	20	VND	t	0
1366	152	Leonardo Thắt Lưng Da Miếng	Xám Khói	M	0	0	PV-152-V110	2026-04-17 04:53:48.574	2026-04-17 04:53:48.574	13	\N	5	5	25	250	20	VND	t	0
1368	152	Leonardo Thắt Lưng Da Miếng	Xanh Rêu	M	0	0	PV-152-V112	2026-04-17 04:53:48.902	2026-04-17 04:53:48.902	13	\N	7	5	25	250	20	VND	t	0
1370	152	Leonardo Thắt Lưng Da Miếng	Xanh Navy	L	0	0	PV-152-V114	2026-04-17 04:53:48.971	2026-04-17 04:53:48.971	13	\N	4	5	25	250	20	VND	t	0
1371	152	Leonardo Thắt Lưng Da Miếng	Be (Cream)	L	0	0	PV-152-V115	2026-04-17 04:53:49.011	2026-04-17 04:53:49.011	13	\N	6	5	25	250	20	VND	t	0
1025	93	Aristino Sơ Mi Flannel Kẻ Caro	Xanh Navy	M	0	0	PV-93-V109	2026-04-17 04:29:01.736	2026-04-17 04:29:01.736	13	\N	4	5	25	250	20	VND	t	0
1026	93	Aristino Sơ Mi Flannel Kẻ Caro	Be (Cream)	M	0	0	PV-93-V110	2026-04-17 04:29:02.012	2026-04-17 04:29:02.012	13	\N	6	5	25	250	20	VND	t	0
1027	93	Aristino Sơ Mi Flannel Kẻ Caro	Xanh Rêu	M	0	0	PV-93-V111	2026-04-17 04:29:02.086	2026-04-17 04:29:02.086	13	\N	7	5	25	250	20	VND	t	0
1028	93	Aristino Sơ Mi Flannel Kẻ Caro	Hồng Pastel	M	0	0	PV-93-V112	2026-04-17 04:29:02.27	2026-04-17 04:29:02.27	13	\N	8	5	25	250	20	VND	t	0
1029	93	Aristino Sơ Mi Flannel Kẻ Caro	Xanh Navy	L	0	0	PV-93-V113	2026-04-17 04:29:02.468	2026-04-17 04:29:02.468	13	\N	4	5	25	250	20	VND	t	0
1031	93	Aristino Sơ Mi Flannel Kẻ Caro	Xanh Rêu	L	0	0	PV-93-V115	2026-04-17 04:29:02.573	2026-04-17 04:29:02.573	13	\N	7	5	25	250	20	VND	t	0
1032	93	Aristino Sơ Mi Flannel Kẻ Caro	Hồng Pastel	L	0	0	PV-93-V116	2026-04-17 04:29:02.64	2026-04-17 04:29:02.64	13	\N	8	5	25	250	20	VND	t	0
1036	93	Aristino Sơ Mi Flannel Kẻ Caro	Hồng Pastel	XL	0	0	PV-93-V120	2026-04-17 04:29:03.318	2026-04-17 04:29:03.318	13	\N	8	5	25	250	20	VND	t	0
551	112	Owen Quần Tây Slim Fit	Đỏ Đô	38	392000	100	SKU-6-1-VAR1	2026-04-16 03:21:41.99	2026-04-17 04:34:44.354	1	\N	3	5	25	350	18	VND	t	0
552	112	Owen Quần Tây Slim Fit	Xanh Navy	39	392000	100	SKU-6-1-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:34:45.913	1	\N	4	5	25	350	18	VND	t	0
553	112	Owen Quần Tây Slim Fit	Xám Khói	40	392000	100	SKU-6-1-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:34:45.919	1	\N	5	5	25	350	18	VND	t	0
554	112	Owen Quần Tây Slim Fit	Be (Cream)	41	392000	100	SKU-6-1-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:34:46.053	1	\N	6	5	25	350	18	VND	t	0
555	112	Owen Quần Tây Slim Fit	Xanh Rêu	42	392000	100	SKU-6-1-VAR5	2026-04-16 03:21:41.99	2026-04-17 04:34:46.136	1	\N	7	5	25	350	18	VND	t	0
556	113	Aristino Quần Kaki Chino Basic	Xanh Navy	38	404000	100	SKU-6-2-VAR1	2026-04-16 03:21:41.99	2026-04-17 04:35:25.83	1	\N	4	5	25	350	18	VND	t	0
557	113	Aristino Quần Kaki Chino Basic	Xám Khói	39	404000	100	SKU-6-2-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:35:27.021	1	\N	5	5	25	350	18	VND	t	0
558	113	Aristino Quần Kaki Chino Basic	Be (Cream)	40	404000	100	SKU-6-2-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:35:27.107	1	\N	6	5	25	350	18	VND	t	0
559	113	Aristino Quần Kaki Chino Basic	Xanh Rêu	41	404000	100	SKU-6-2-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:35:27.17	1	\N	7	5	25	350	18	VND	t	0
560	113	Aristino Quần Kaki Chino Basic	Hồng Pastel	42	404000	100	SKU-6-2-VAR5	2026-04-16 03:21:41.99	2026-04-17 04:35:27.22	1	\N	8	5	25	350	18	VND	t	0
1162	83	Routine Áo Polo Excool	Hồng Pastel	S	0	0	PV-83-V106	2026-04-17 04:35:56.514	2026-04-17 04:35:56.514	13	\N	8	5	25	250	20	VND	t	0
1163	83	Routine Áo Polo Excool	Be (Cream)	S	0	0	PV-83-V107	2026-04-17 04:35:56.588	2026-04-17 04:35:56.588	13	\N	6	5	25	250	20	VND	t	0
1164	83	Routine Áo Polo Excool	Xanh Rêu	S	0	0	PV-83-V108	2026-04-17 04:35:56.606	2026-04-17 04:35:56.606	13	\N	7	5	25	250	20	VND	t	0
1165	83	Routine Áo Polo Excool	Xanh Navy	M	0	0	PV-83-V109	2026-04-17 04:35:56.616	2026-04-17 04:35:56.616	13	\N	4	5	25	250	20	VND	t	0
561	114	Routine Quần Tây Âu Lịch Sự	Xám Khói	38	416000	100	SKU-6-3-VAR1	2026-04-16 03:21:41.99	2026-04-17 04:37:40.757	1	\N	5	5	25	350	18	VND	t	0
562	114	Routine Quần Tây Âu Lịch Sự	Be (Cream)	39	416000	100	SKU-6-3-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:37:41.933	1	\N	6	5	25	350	18	VND	t	0
563	114	Routine Quần Tây Âu Lịch Sự	Xanh Rêu	40	416000	100	SKU-6-3-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:37:42.411	1	\N	7	5	25	350	18	VND	t	0
564	114	Routine Quần Tây Âu Lịch Sự	Hồng Pastel	41	416000	100	SKU-6-3-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:37:42.446	1	\N	8	5	25	350	18	VND	t	0
565	114	Routine Quần Tây Âu Lịch Sự	Nâu Đất	42	416000	100	SKU-6-3-VAR5	2026-04-16 03:21:41.99	2026-04-17 04:37:42.461	1	\N	9	5	25	350	18	VND	t	0
1041	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Be (Cream)	S	0	0	PV-94-V105	2026-04-17 04:30:02.106	2026-04-17 04:30:02.106	13	\N	6	5	25	250	20	VND	t	0
1043	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Nâu Đất	S	0	0	PV-94-V108	2026-04-17 04:30:02.128	2026-04-17 04:30:02.128	13	\N	9	5	25	250	20	VND	t	0
1045	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Xanh Rêu	S	0	0	PV-94-V106	2026-04-17 04:30:02.166	2026-04-17 04:30:02.166	13	\N	7	5	25	250	20	VND	t	0
1046	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Xanh Rêu	M	0	0	PV-94-V110	2026-04-17 04:30:02.476	2026-04-17 04:30:02.476	13	\N	7	5	25	250	20	VND	t	0
1047	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Hồng Pastel	M	0	0	PV-94-V111	2026-04-17 04:30:02.565	2026-04-17 04:30:02.565	13	\N	8	5	25	250	20	VND	t	0
1050	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Be (Cream)	L	0	0	PV-94-V114	2026-04-17 04:30:02.905	2026-04-17 04:30:02.905	13	\N	6	5	25	250	20	VND	t	0
1051	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Hồng Pastel	L	0	0	PV-94-V115	2026-04-17 04:30:02.92	2026-04-17 04:30:02.92	13	\N	8	5	25	250	20	VND	t	0
1052	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Nâu Đất	L	0	0	PV-94-V116	2026-04-17 04:30:03.015	2026-04-17 04:30:03.015	13	\N	9	5	25	250	20	VND	t	0
1053	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Xám Khói	XL	0	0	PV-94-V117	2026-04-17 04:30:03.058	2026-04-17 04:30:03.058	13	\N	5	5	25	250	20	VND	t	0
1054	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Be (Cream)	XL	0	0	PV-94-V118	2026-04-17 04:30:03.208	2026-04-17 04:30:03.208	13	\N	6	5	25	250	20	VND	t	0
1166	83	Routine Áo Polo Excool	Hồng Pastel	M	0	0	PV-83-V110	2026-04-17 04:35:56.639	2026-04-17 04:35:56.639	13	\N	8	5	25	250	20	VND	t	0
1168	83	Routine Áo Polo Excool	Xanh Rêu	M	0	0	PV-83-V112	2026-04-17 04:35:56.681	2026-04-17 04:35:56.681	13	\N	7	5	25	250	20	VND	t	0
1169	83	Routine Áo Polo Excool	Xanh Navy	XXL	0	0	PV-83-V113	2026-04-17 04:35:56.706	2026-04-17 04:35:56.706	13	\N	4	5	25	250	20	VND	t	0
1170	83	Routine Áo Polo Excool	Be (Cream)	XXL	0	0	PV-83-V115	2026-04-17 04:35:56.718	2026-04-17 04:35:56.718	13	\N	6	5	25	250	20	VND	t	0
1172	83	Routine Áo Polo Excool	Xanh Rêu	XXL	0	0	PV-83-V116	2026-04-17 04:35:56.733	2026-04-17 04:35:56.733	13	\N	7	5	25	250	20	VND	t	0
1173	83	Routine Áo Polo Excool	Xanh Navy	L	0	0	PV-83-V117	2026-04-17 04:35:56.749	2026-04-17 04:35:56.749	13	\N	4	5	25	250	20	VND	t	0
1182	114	Routine Quần Tây Âu Lịch Sự	Hồng Pastel	38	0	0	PV-114-V107	2026-04-17 04:37:40.749	2026-04-17 04:37:40.749	13	\N	8	5	25	250	20	VND	t	0
1191	114	Routine Quần Tây Âu Lịch Sự	Hồng Pastel	40	0	0	PV-114-V115	2026-04-17 04:37:41.581	2026-04-17 04:37:41.581	13	\N	8	5	25	250	20	VND	t	0
1193	114	Routine Quần Tây Âu Lịch Sự	Xám Khói	41	0	0	PV-114-V117	2026-04-17 04:37:41.643	2026-04-17 04:37:41.643	13	\N	5	5	25	250	20	VND	t	0
1194	114	Routine Quần Tây Âu Lịch Sự	Be (Cream)	41	0	0	PV-114-V118	2026-04-17 04:37:41.649	2026-04-17 04:37:41.649	13	\N	6	5	25	250	20	VND	t	0
1195	114	Routine Quần Tây Âu Lịch Sự	Xanh Rêu	41	0	0	PV-114-V119	2026-04-17 04:37:41.662	2026-04-17 04:37:41.662	13	\N	7	5	25	250	20	VND	t	0
1197	114	Routine Quần Tây Âu Lịch Sự	Xám Khói	42	0	0	PV-114-V121	2026-04-17 04:37:41.873	2026-04-17 04:37:41.873	13	\N	5	5	25	250	20	VND	t	0
1302	142	MLB Nón Kết NY Yankees	Be (Cream)	S	0	0	PV-142-V107	2026-04-17 04:47:28.765	2026-04-17 04:47:28.765	13	\N	6	5	25	250	20	VND	t	0
1304	142	MLB Nón Kết NY Yankees	Xanh Rêu	S	0	0	PV-142-V108	2026-04-17 04:47:28.78	2026-04-17 04:47:28.78	13	\N	7	5	25	250	20	VND	t	0
1305	142	MLB Nón Kết NY Yankees	Đỏ Đô	M	0	0	PV-142-V109	2026-04-17 04:47:28.807	2026-04-17 04:47:28.807	13	\N	3	5	25	250	20	VND	t	0
1306	142	MLB Nón Kết NY Yankees	Xám Khói	M	0	0	PV-142-V110	2026-04-17 04:47:29.945	2026-04-17 04:47:29.945	13	\N	5	5	25	250	20	VND	t	0
1307	142	MLB Nón Kết NY Yankees	Be (Cream)	M	0	0	PV-142-V111	2026-04-17 04:47:30.212	2026-04-17 04:47:30.212	13	\N	6	5	25	250	20	VND	t	0
1308	142	MLB Nón Kết NY Yankees	Xanh Rêu	M	0	0	PV-142-V112	2026-04-17 04:47:30.35	2026-04-17 04:47:30.35	13	\N	7	5	25	250	20	VND	t	0
1309	142	MLB Nón Kết NY Yankees	Đỏ Đô	L	0	0	PV-142-V113	2026-04-17 04:47:31.107	2026-04-17 04:47:31.107	13	\N	3	5	25	250	20	VND	t	0
1310	142	MLB Nón Kết NY Yankees	Xanh Navy	L	0	0	PV-142-V114	2026-04-17 04:47:31.125	2026-04-17 04:47:31.125	13	\N	4	5	25	250	20	VND	t	0
1311	142	MLB Nón Kết NY Yankees	Be (Cream)	L	0	0	PV-142-V115	2026-04-17 04:47:31.379	2026-04-17 04:47:31.379	13	\N	6	5	25	250	20	VND	t	0
1312	142	MLB Nón Kết NY Yankees	Xanh Rêu	L	0	0	PV-142-V116	2026-04-17 04:47:31.703	2026-04-17 04:47:31.703	13	\N	7	5	25	250	20	VND	t	0
1313	142	MLB Nón Kết NY Yankees	Đỏ Đô	XL	0	0	PV-142-V117	2026-04-17 04:47:32.309	2026-04-17 04:47:32.309	13	\N	3	5	25	250	20	VND	t	0
1314	142	MLB Nón Kết NY Yankees	Xanh Navy	XL	0	0	PV-142-V118	2026-04-17 04:47:32.417	2026-04-17 04:47:32.417	13	\N	4	5	25	250	20	VND	t	0
1315	142	MLB Nón Kết NY Yankees	Xám Khói	XL	0	0	PV-142-V119	2026-04-17 04:47:32.655	2026-04-17 04:47:32.655	13	\N	5	5	25	250	20	VND	t	0
1316	142	MLB Nón Kết NY Yankees	Xanh Rêu	XL	0	0	PV-142-V120	2026-04-17 04:47:32.791	2026-04-17 04:47:32.791	13	\N	7	5	25	250	20	VND	t	0
1317	142	MLB Nón Kết NY Yankees	Đỏ Đô	XXL	0	0	PV-142-V121	2026-04-17 04:47:33.28	2026-04-17 04:47:33.28	13	\N	3	5	25	250	20	VND	t	0
1318	142	MLB Nón Kết NY Yankees	Xanh Navy	XXL	0	0	PV-142-V122	2026-04-17 04:47:33.333	2026-04-17 04:47:33.333	13	\N	4	5	25	250	20	VND	t	0
1320	142	MLB Nón Kết NY Yankees	Be (Cream)	XXL	0	0	PV-142-V124	2026-04-17 04:47:33.873	2026-04-17 04:47:33.873	13	\N	6	5	25	250	20	VND	t	0
1325	166	5theway Áo Hoodie Oversize	Nâu Đất	S	0	0	PV-166-V106	2026-04-17 04:49:40.024	2026-04-17 04:49:40.024	13	\N	9	5	25	250	20	VND	t	0
1055	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Xanh Rêu	XL	0	0	PV-94-V119	2026-04-17 04:30:03.299	2026-04-17 04:30:03.299	13	\N	7	5	25	250	20	VND	t	0
1080	102	Routine Quần Jean Slim Fit	Be (Cream)	42	0	0	PV-102-V124	2026-04-17 04:31:27.775	2026-04-17 04:31:27.775	13	\N	6	5	25	250	20	VND	t	0
1083	104	Copper Denim Quần Jean Baggy Nam	Xanh Rêu	38	0	0	PV-104-V106	2026-04-17 04:32:10.238	2026-04-17 04:32:10.238	13	\N	7	5	25	250	20	VND	t	0
1089	104	Copper Denim Quần Jean Baggy Nam	Xám Khói	40	0	0	PV-104-V113	2026-04-17 04:32:11.387	2026-04-17 04:32:11.387	13	\N	5	5	25	250	20	VND	t	0
1103	106	DirtyCoins Quần Jean Rách Gối	Xanh Rêu	39	0	0	PV-106-V109	2026-04-17 04:33:32.926	2026-04-17 04:33:32.926	13	\N	7	5	25	250	20	VND	t	0
1104	106	DirtyCoins Quần Jean Rách Gối	Đen Tuyền	38	0	0	PV-106-V108	2026-04-17 04:33:32.942	2026-04-17 04:33:32.942	13	\N	1	5	25	250	20	VND	t	0
1113	106	DirtyCoins Quần Jean Rách Gối	Hồng Pastel	41	0	0	PV-106-V118	2026-04-17 04:33:36.745	2026-04-17 04:33:36.745	13	\N	8	5	25	250	20	VND	t	0
1201	123	Ananas Giày Slip-on Basic	Xám Khói	S	0	0	PV-123-V105	2026-04-17 04:38:57.297	2026-04-17 04:38:57.297	13	\N	5	5	25	250	20	VND	t	0
1202	123	Ananas Giày Slip-on Basic	Xanh Rêu	S	0	0	PV-123-V107	2026-04-17 04:38:57.307	2026-04-17 04:38:57.307	13	\N	7	5	25	250	20	VND	t	0
1203	123	Ananas Giày Slip-on Basic	Be (Cream)	S	0	0	PV-123-V106	2026-04-17 04:38:57.314	2026-04-17 04:38:57.314	13	\N	6	5	25	250	20	VND	t	0
1204	123	Ananas Giày Slip-on Basic	Hồng Pastel	S	0	0	PV-123-V108	2026-04-17 04:38:57.321	2026-04-17 04:38:57.321	13	\N	8	5	25	250	20	VND	t	0
1209	123	Ananas Giày Slip-on Basic	Xanh Navy	L	0	0	PV-123-V113	2026-04-17 04:38:58.328	2026-04-17 04:38:58.328	13	\N	4	5	25	250	20	VND	t	0
1210	123	Ananas Giày Slip-on Basic	Xám Khói	L	0	0	PV-123-V114	2026-04-17 04:38:58.626	2026-04-17 04:38:58.626	13	\N	5	5	25	250	20	VND	t	0
1212	123	Ananas Giày Slip-on Basic	Hồng Pastel	L	0	0	PV-123-V116	2026-04-17 04:38:58.774	2026-04-17 04:38:58.774	13	\N	8	5	25	250	20	VND	t	0
1213	123	Ananas Giày Slip-on Basic	Xanh Navy	XL	0	0	PV-123-V117	2026-04-17 04:38:58.846	2026-04-17 04:38:58.846	13	\N	4	5	25	250	20	VND	t	0
1214	123	Ananas Giày Slip-on Basic	Xám Khói	XL	0	0	PV-123-V118	2026-04-17 04:38:59.085	2026-04-17 04:38:59.085	13	\N	5	5	25	250	20	VND	t	0
607	123	Ananas Giày Slip-on Basic	Xám Khói	M	710000	100	SKU-7-2-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:38:59.536	1	\N	5	5	25	350	18	VND	t	0
608	123	Ananas Giày Slip-on Basic	Be (Cream)	L	710000	100	SKU-7-2-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:38:59.861	1	\N	6	5	25	350	18	VND	t	0
609	123	Ananas Giày Slip-on Basic	Xanh Rêu	XL	710000	100	SKU-7-2-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:38:59.876	1	\N	7	5	25	350	18	VND	t	0
610	123	Ananas Giày Slip-on Basic	Hồng Pastel	XXL	710000	100	SKU-7-2-VAR5	2026-04-16 03:21:41.99	2026-04-17 04:38:59.933	1	\N	8	5	25	350	18	VND	t	0
621	126	Vento Giày Sandal Thể Thao	Xanh Rêu	S	800000	100	SKU-7-5-VAR1	2026-04-16 03:21:41.99	2026-04-17 04:40:31.533	1	\N	7	5	25	350	18	VND	t	0
1225	126	Vento Giày Sandal Thể Thao	Xanh Rêu	M	0	0	PV-126-V109	2026-04-17 04:40:31.546	2026-04-17 04:40:31.546	13	\N	7	5	25	250	20	VND	t	0
1226	126	Vento Giày Sandal Thể Thao	Nâu Đất	M	0	0	PV-126-V110	2026-04-17 04:40:31.834	2026-04-17 04:40:31.834	13	\N	9	5	25	250	20	VND	t	0
1227	126	Vento Giày Sandal Thể Thao	Vàng Mù Tạt	M	0	0	PV-126-V111	2026-04-17 04:40:32.433	2026-04-17 04:40:32.433	13	\N	10	5	25	250	20	VND	t	0
1228	126	Vento Giày Sandal Thể Thao	Đen Tuyền	M	0	0	PV-126-V112	2026-04-17 04:40:32.5	2026-04-17 04:40:32.5	13	\N	1	5	25	250	20	VND	t	0
1229	126	Vento Giày Sandal Thể Thao	Xanh Rêu	L	0	0	PV-126-V113	2026-04-17 04:40:32.712	2026-04-17 04:40:32.712	13	\N	7	5	25	250	20	VND	t	0
1238	126	Vento Giày Sandal Thể Thao	Hồng Pastel	XXL	0	0	PV-126-V122	2026-04-17 04:40:34.055	2026-04-17 04:40:34.055	13	\N	8	5	25	250	20	VND	t	0
622	126	Vento Giày Sandal Thể Thao	Hồng Pastel	M	800000	100	SKU-7-5-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:40:34.292	1	\N	8	5	25	350	18	VND	t	0
623	126	Vento Giày Sandal Thể Thao	Nâu Đất	L	800000	100	SKU-7-5-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:40:34.523	1	\N	9	5	25	350	18	VND	t	0
624	126	Vento Giày Sandal Thể Thao	Vàng Mù Tạt	XL	800000	100	SKU-7-5-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:40:34.769	1	\N	10	5	25	350	18	VND	t	0
625	126	Vento Giày Sandal Thể Thao	Đen Tuyền	XXL	800000	100	SKU-7-5-VAR5	2026-04-16 03:21:41.99	2026-04-17 04:40:35.049	1	\N	1	5	25	350	18	VND	t	0
631	128	Skechers Giày Tập Gym Êm Ái	Nâu Đất	S	860000	100	SKU-7-7-VAR1	2026-04-16 03:21:41.99	2026-04-17 04:41:45.646	1	\N	9	5	25	350	18	VND	t	0
632	128	Skechers Giày Tập Gym Êm Ái	Vàng Mù Tạt	M	860000	100	SKU-7-7-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:41:48.402	1	\N	10	5	25	350	18	VND	t	0
633	128	Skechers Giày Tập Gym Êm Ái	Đen Tuyền	L	860000	100	SKU-7-7-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:41:48.953	1	\N	1	5	25	350	18	VND	t	0
634	128	Skechers Giày Tập Gym Êm Ái	Trắng Basic	XL	860000	100	SKU-7-7-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:41:49.093	1	\N	2	5	25	350	18	VND	t	0
1321	166	5theway Áo Hoodie Oversize	Hồng Pastel	S	0	0	PV-166-V105	2026-04-17 04:49:39.977	2026-04-17 04:49:39.977	13	\N	8	5	25	250	20	VND	t	0
1323	166	5theway Áo Hoodie Oversize	Xanh Rêu	M	0	0	PV-166-V109	2026-04-17 04:49:39.988	2026-04-17 04:49:39.988	13	\N	7	5	25	250	20	VND	t	0
1362	152	Leonardo Thắt Lưng Da Miếng	Xanh Navy	S	0	0	PV-152-V105	2026-04-17 04:53:48.159	2026-04-17 04:53:48.159	13	\N	4	5	25	250	20	VND	t	0
1056	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Nâu Đất	XL	0	0	PV-94-V120	2026-04-17 04:30:03.453	2026-04-17 04:30:03.453	13	\N	9	5	25	250	20	VND	t	0
1057	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Xám Khói	XXL	0	0	PV-94-V121	2026-04-17 04:30:03.467	2026-04-17 04:30:03.467	13	\N	5	5	25	250	20	VND	t	0
1059	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Xanh Rêu	XXL	0	0	PV-94-V123	2026-04-17 04:30:03.533	2026-04-17 04:30:03.533	13	\N	7	5	25	250	20	VND	t	0
1060	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Hồng Pastel	XXL	0	0	PV-94-V124	2026-04-17 04:30:03.591	2026-04-17 04:30:03.591	13	\N	8	5	25	250	20	VND	t	0
1205	123	Ananas Giày Slip-on Basic	Xanh Navy	M	0	0	PV-123-V109	2026-04-17 04:38:57.363	2026-04-17 04:38:57.363	13	\N	4	5	25	250	20	VND	t	0
1206	123	Ananas Giày Slip-on Basic	Be (Cream)	M	0	0	PV-123-V110	2026-04-17 04:38:57.814	2026-04-17 04:38:57.814	13	\N	6	5	25	250	20	VND	t	0
1207	123	Ananas Giày Slip-on Basic	Xanh Rêu	M	0	0	PV-123-V111	2026-04-17 04:38:57.921	2026-04-17 04:38:57.921	13	\N	7	5	25	250	20	VND	t	0
1208	123	Ananas Giày Slip-on Basic	Hồng Pastel	M	0	0	PV-123-V112	2026-04-17 04:38:58.291	2026-04-17 04:38:58.291	13	\N	8	5	25	250	20	VND	t	0
1211	123	Ananas Giày Slip-on Basic	Xanh Rêu	L	0	0	PV-123-V115	2026-04-17 04:38:58.727	2026-04-17 04:38:58.727	13	\N	7	5	25	250	20	VND	t	0
1215	123	Ananas Giày Slip-on Basic	Be (Cream)	XL	0	0	PV-123-V119	2026-04-17 04:38:59.142	2026-04-17 04:38:59.142	13	\N	6	5	25	250	20	VND	t	0
1216	123	Ananas Giày Slip-on Basic	Hồng Pastel	XL	0	0	PV-123-V120	2026-04-17 04:38:59.15	2026-04-17 04:38:59.15	13	\N	8	5	25	250	20	VND	t	0
1217	123	Ananas Giày Slip-on Basic	Xanh Navy	XXL	0	0	PV-123-V121	2026-04-17 04:38:59.212	2026-04-17 04:38:59.212	13	\N	4	5	25	250	20	VND	t	0
1218	123	Ananas Giày Slip-on Basic	Xám Khói	XXL	0	0	PV-123-V122	2026-04-17 04:38:59.283	2026-04-17 04:38:59.283	13	\N	5	5	25	250	20	VND	t	0
1219	123	Ananas Giày Slip-on Basic	Be (Cream)	XXL	0	0	PV-123-V123	2026-04-17 04:38:59.363	2026-04-17 04:38:59.363	13	\N	6	5	25	250	20	VND	t	0
1220	123	Ananas Giày Slip-on Basic	Xanh Rêu	XXL	0	0	PV-123-V124	2026-04-17 04:38:59.489	2026-04-17 04:38:59.489	13	\N	7	5	25	250	20	VND	t	0
651	132	LaForce Giày Oxford Da Bò	Đỏ Đô	S	900000	100	SKU-8-1-VAR1	2026-04-16 03:21:41.99	2026-04-17 04:44:39.216	1	\N	3	5	25	350	18	VND	t	0
652	132	LaForce Giày Oxford Da Bò	Xanh Navy	M	900000	100	SKU-8-1-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:44:44.201	1	\N	4	5	25	350	18	VND	t	0
653	132	LaForce Giày Oxford Da Bò	Xám Khói	L	900000	100	SKU-8-1-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:44:44.683	1	\N	5	5	25	350	18	VND	t	0
654	132	LaForce Giày Oxford Da Bò	Be (Cream)	XL	900000	100	SKU-8-1-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:44:44.685	1	\N	6	5	25	350	18	VND	t	0
655	132	LaForce Giày Oxford Da Bò	Xanh Rêu	XXL	900000	100	SKU-8-1-VAR5	2026-04-16 03:21:41.99	2026-04-17 04:44:44.986	1	\N	7	5	25	350	18	VND	t	0
1326	166	5theway Áo Hoodie Oversize	Nâu Đất	M	0	0	PV-166-V110	2026-04-17 04:49:40.94	2026-04-17 04:49:40.94	13	\N	9	5	25	250	20	VND	t	0
1327	166	5theway Áo Hoodie Oversize	Vàng Mù Tạt	M	0	0	PV-166-V111	2026-04-17 04:49:41.286	2026-04-17 04:49:41.286	13	\N	10	5	25	250	20	VND	t	0
1328	166	5theway Áo Hoodie Oversize	Đen Tuyền	M	0	0	PV-166-V112	2026-04-17 04:49:41.719	2026-04-17 04:49:41.719	13	\N	1	5	25	250	20	VND	t	0
1329	166	5theway Áo Hoodie Oversize	Xanh Rêu	L	0	0	PV-166-V113	2026-04-17 04:49:41.974	2026-04-17 04:49:41.974	13	\N	7	5	25	250	20	VND	t	0
1330	166	5theway Áo Hoodie Oversize	Hồng Pastel	L	0	0	PV-166-V114	2026-04-17 04:49:42.149	2026-04-17 04:49:42.149	13	\N	8	5	25	250	20	VND	t	0
1332	166	5theway Áo Hoodie Oversize	Đen Tuyền	L	0	0	PV-166-V116	2026-04-17 04:49:42.669	2026-04-17 04:49:42.669	13	\N	1	5	25	250	20	VND	t	0
1333	166	5theway Áo Hoodie Oversize	Xanh Rêu	XL	0	0	PV-166-V117	2026-04-17 04:49:43.027	2026-04-17 04:49:43.027	13	\N	7	5	25	250	20	VND	t	0
1334	166	5theway Áo Hoodie Oversize	Hồng Pastel	XL	0	0	PV-166-V118	2026-04-17 04:49:43.124	2026-04-17 04:49:43.124	13	\N	8	5	25	250	20	VND	t	0
1335	166	5theway Áo Hoodie Oversize	Nâu Đất	XL	0	0	PV-166-V119	2026-04-17 04:49:43.248	2026-04-17 04:49:43.248	13	\N	9	5	25	250	20	VND	t	0
1336	166	5theway Áo Hoodie Oversize	Đen Tuyền	XL	0	0	PV-166-V120	2026-04-17 04:49:43.352	2026-04-17 04:49:43.352	13	\N	1	5	25	250	20	VND	t	0
1337	166	5theway Áo Hoodie Oversize	Xanh Rêu	XXL	0	0	PV-166-V121	2026-04-17 04:49:44.004	2026-04-17 04:49:44.004	13	\N	7	5	25	250	20	VND	t	0
1338	166	5theway Áo Hoodie Oversize	Hồng Pastel	XXL	0	0	PV-166-V122	2026-04-17 04:49:44.156	2026-04-17 04:49:44.156	13	\N	8	5	25	250	20	VND	t	0
1339	166	5theway Áo Hoodie Oversize	Nâu Đất	XXL	0	0	PV-166-V123	2026-04-17 04:49:44.371	2026-04-17 04:49:44.371	13	\N	9	5	25	250	20	VND	t	0
1340	166	5theway Áo Hoodie Oversize	Vàng Mù Tạt	XXL	0	0	PV-166-V124	2026-04-17 04:49:44.441	2026-04-17 04:49:44.441	13	\N	10	5	25	250	20	VND	t	0
1364	152	Leonardo Thắt Lưng Da Miếng	Xám Khói	S	0	0	PV-152-V106	2026-04-17 04:53:48.175	2026-04-17 04:53:48.175	13	\N	5	5	25	250	20	VND	t	0
1383	153	KaLong Ví Da Bò Saffiano	Xanh Navy	M	0	0	PV-153-V109	2026-04-17 04:54:59.427	2026-04-17 04:54:59.427	13	\N	4	5	25	250	20	VND	t	0
1388	153	KaLong Ví Da Bò Saffiano	Hồng Pastel	M	0	0	PV-153-V112	2026-04-17 04:55:00.42	2026-04-17 04:55:00.42	13	\N	8	5	25	250	20	VND	t	0
1389	153	KaLong Ví Da Bò Saffiano	Xanh Navy	L	0	0	PV-153-V113	2026-04-17 04:55:00.469	2026-04-17 04:55:00.469	13	\N	4	5	25	250	20	VND	t	0
1390	153	KaLong Ví Da Bò Saffiano	Xám Khói	L	0	0	PV-153-V114	2026-04-17 04:55:00.638	2026-04-17 04:55:00.638	13	\N	5	5	25	250	20	VND	t	0
1058	94	Routine Sơ Mi Bamboo Kháng Khuẩn	Be (Cream)	XXL	0	0	PV-94-V122	2026-04-17 04:30:03.491	2026-04-17 04:30:03.491	13	\N	6	5	25	250	20	VND	t	0
1221	126	Vento Giày Sandal Thể Thao	Hồng Pastel	S	0	0	PV-126-V105	2026-04-17 04:40:31.481	2026-04-17 04:40:31.481	13	\N	8	5	25	250	20	VND	t	0
1222	126	Vento Giày Sandal Thể Thao	Vàng Mù Tạt	S	0	0	PV-126-V107	2026-04-17 04:40:31.495	2026-04-17 04:40:31.495	13	\N	10	5	25	250	20	VND	t	0
1224	126	Vento Giày Sandal Thể Thao	Đen Tuyền	S	0	0	PV-126-V108	2026-04-17 04:40:31.507	2026-04-17 04:40:31.507	13	\N	1	5	25	250	20	VND	t	0
1239	126	Vento Giày Sandal Thể Thao	Nâu Đất	XXL	0	0	PV-126-V123	2026-04-17 04:40:34.068	2026-04-17 04:40:34.068	13	\N	9	5	25	250	20	VND	t	0
1240	126	Vento Giày Sandal Thể Thao	Vàng Mù Tạt	XXL	0	0	PV-126-V124	2026-04-17 04:40:34.207	2026-04-17 04:40:34.207	13	\N	10	5	25	250	20	VND	t	0
1244	128	Skechers Giày Tập Gym Êm Ái	Đỏ Đô	S	0	0	PV-128-V108	2026-04-17 04:41:45.667	2026-04-17 04:41:45.667	13	\N	3	5	25	250	20	VND	t	0
1245	128	Skechers Giày Tập Gym Êm Ái	Nâu Đất	M	0	0	PV-128-V109	2026-04-17 04:41:45.707	2026-04-17 04:41:45.707	13	\N	9	5	25	250	20	VND	t	0
1246	128	Skechers Giày Tập Gym Êm Ái	Đen Tuyền	M	0	0	PV-128-V110	2026-04-17 04:41:46.441	2026-04-17 04:41:46.441	13	\N	1	5	25	250	20	VND	t	0
1247	128	Skechers Giày Tập Gym Êm Ái	Trắng Basic	M	0	0	PV-128-V111	2026-04-17 04:41:46.479	2026-04-17 04:41:46.479	13	\N	2	5	25	250	20	VND	t	0
1248	128	Skechers Giày Tập Gym Êm Ái	Đỏ Đô	M	0	0	PV-128-V112	2026-04-17 04:41:46.746	2026-04-17 04:41:46.746	13	\N	3	5	25	250	20	VND	t	0
1249	128	Skechers Giày Tập Gym Êm Ái	Nâu Đất	L	0	0	PV-128-V113	2026-04-17 04:41:46.914	2026-04-17 04:41:46.914	13	\N	9	5	25	250	20	VND	t	0
1250	128	Skechers Giày Tập Gym Êm Ái	Vàng Mù Tạt	L	0	0	PV-128-V114	2026-04-17 04:41:47.177	2026-04-17 04:41:47.177	13	\N	10	5	25	250	20	VND	t	0
1251	128	Skechers Giày Tập Gym Êm Ái	Trắng Basic	L	0	0	PV-128-V115	2026-04-17 04:41:47.301	2026-04-17 04:41:47.301	13	\N	2	5	25	250	20	VND	t	0
1252	128	Skechers Giày Tập Gym Êm Ái	Đỏ Đô	L	0	0	PV-128-V116	2026-04-17 04:41:47.58	2026-04-17 04:41:47.58	13	\N	3	5	25	250	20	VND	t	0
1253	128	Skechers Giày Tập Gym Êm Ái	Nâu Đất	XL	0	0	PV-128-V117	2026-04-17 04:41:47.616	2026-04-17 04:41:47.616	13	\N	9	5	25	250	20	VND	t	0
1254	128	Skechers Giày Tập Gym Êm Ái	Vàng Mù Tạt	XL	0	0	PV-128-V118	2026-04-17 04:41:47.716	2026-04-17 04:41:47.716	13	\N	10	5	25	250	20	VND	t	0
1255	128	Skechers Giày Tập Gym Êm Ái	Đen Tuyền	XL	0	0	PV-128-V119	2026-04-17 04:41:48.122	2026-04-17 04:41:48.122	13	\N	1	5	25	250	20	VND	t	0
1256	128	Skechers Giày Tập Gym Êm Ái	Đỏ Đô	XL	0	0	PV-128-V120	2026-04-17 04:41:48.224	2026-04-17 04:41:48.224	13	\N	3	5	25	250	20	VND	t	0
1257	128	Skechers Giày Tập Gym Êm Ái	Nâu Đất	XXL	0	0	PV-128-V121	2026-04-17 04:41:48.326	2026-04-17 04:41:48.326	13	\N	9	5	25	250	20	VND	t	0
1258	128	Skechers Giày Tập Gym Êm Ái	Vàng Mù Tạt	XXL	0	0	PV-128-V122	2026-04-17 04:41:48.51	2026-04-17 04:41:48.51	13	\N	10	5	25	250	20	VND	t	0
1259	128	Skechers Giày Tập Gym Êm Ái	Đen Tuyền	XXL	0	0	PV-128-V123	2026-04-17 04:41:48.713	2026-04-17 04:41:48.713	13	\N	1	5	25	250	20	VND	t	0
1260	128	Skechers Giày Tập Gym Êm Ái	Trắng Basic	XXL	0	0	PV-128-V124	2026-04-17 04:41:48.909	2026-04-17 04:41:48.909	13	\N	2	5	25	250	20	VND	t	0
673	136	Zapatos Giày Chelsea Boots	Nâu Đất	L	1100000	100	SKU-8-5-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:45:43.381	1	\N	9	5	25	350	18	VND	t	0
674	136	Zapatos Giày Chelsea Boots	Vàng Mù Tạt	XL	1100000	100	SKU-8-5-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:45:43.397	1	\N	10	5	25	350	18	VND	t	0
675	136	Zapatos Giày Chelsea Boots	Đen Tuyền	XXL	1100000	100	SKU-8-5-VAR5	2026-04-16 03:21:41.99	2026-04-17 04:45:43.427	1	\N	1	5	25	350	18	VND	t	0
701	142	MLB Nón Kết NY Yankees	Đỏ Đô	S	155000	100	SKU-9-1-VAR1	2026-04-16 03:21:41.99	2026-04-17 04:47:28.767	1	\N	3	5	25	350	18	VND	t	0
702	142	MLB Nón Kết NY Yankees	Xanh Navy	M	155000	100	SKU-9-1-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:47:33.475	1	\N	4	5	25	350	18	VND	t	0
703	142	MLB Nón Kết NY Yankees	Xám Khói	L	155000	100	SKU-9-1-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:47:34.716	1	\N	5	5	25	350	18	VND	t	0
704	142	MLB Nón Kết NY Yankees	Be (Cream)	XL	155000	100	SKU-9-1-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:47:34.953	1	\N	6	5	25	350	18	VND	t	0
1061	102	Routine Quần Jean Slim Fit	Xanh Navy	38	0	0	PV-102-V105	2026-04-17 04:31:24.726	2026-04-17 04:31:24.726	13	\N	4	5	25	250	20	VND	t	0
1063	102	Routine Quần Jean Slim Fit	Xám Khói	38	0	0	PV-102-V106	2026-04-17 04:31:24.748	2026-04-17 04:31:24.748	13	\N	5	5	25	250	20	VND	t	0
1064	102	Routine Quần Jean Slim Fit	Xanh Rêu	38	0	0	PV-102-V108	2026-04-17 04:31:24.763	2026-04-17 04:31:24.763	13	\N	7	5	25	250	20	VND	t	0
1066	102	Routine Quần Jean Slim Fit	Xám Khói	39	0	0	PV-102-V110	2026-04-17 04:31:25.064	2026-04-17 04:31:25.064	13	\N	5	5	25	250	20	VND	t	0
1067	102	Routine Quần Jean Slim Fit	Be (Cream)	39	0	0	PV-102-V111	2026-04-17 04:31:25.074	2026-04-17 04:31:25.074	13	\N	6	5	25	250	20	VND	t	0
1068	102	Routine Quần Jean Slim Fit	Xanh Rêu	39	0	0	PV-102-V112	2026-04-17 04:31:25.368	2026-04-17 04:31:25.368	13	\N	7	5	25	250	20	VND	t	0
1069	102	Routine Quần Jean Slim Fit	Đỏ Đô	40	0	0	PV-102-V113	2026-04-17 04:31:25.608	2026-04-17 04:31:25.608	13	\N	3	5	25	250	20	VND	t	0
1070	102	Routine Quần Jean Slim Fit	Xanh Navy	40	0	0	PV-102-V114	2026-04-17 04:31:25.694	2026-04-17 04:31:25.694	13	\N	4	5	25	250	20	VND	t	0
1073	102	Routine Quần Jean Slim Fit	Đỏ Đô	41	0	0	PV-102-V117	2026-04-17 04:31:25.999	2026-04-17 04:31:25.999	13	\N	3	5	25	250	20	VND	t	0
1076	102	Routine Quần Jean Slim Fit	Xanh Rêu	41	0	0	PV-102-V120	2026-04-17 04:31:26.885	2026-04-17 04:31:26.885	13	\N	7	5	25	250	20	VND	t	0
1077	102	Routine Quần Jean Slim Fit	Đỏ Đô	42	0	0	PV-102-V121	2026-04-17 04:31:27.284	2026-04-17 04:31:27.284	13	\N	3	5	25	250	20	VND	t	0
1078	102	Routine Quần Jean Slim Fit	Xanh Navy	42	0	0	PV-102-V122	2026-04-17 04:31:27.477	2026-04-17 04:31:27.477	13	\N	4	5	25	250	20	VND	t	0
1223	126	Vento Giày Sandal Thể Thao	Nâu Đất	S	0	0	PV-126-V106	2026-04-17 04:40:31.501	2026-04-17 04:40:31.501	13	\N	9	5	25	250	20	VND	t	0
1230	126	Vento Giày Sandal Thể Thao	Hồng Pastel	L	0	0	PV-126-V114	2026-04-17 04:40:32.793	2026-04-17 04:40:32.793	13	\N	8	5	25	250	20	VND	t	0
1231	126	Vento Giày Sandal Thể Thao	Vàng Mù Tạt	L	0	0	PV-126-V115	2026-04-17 04:40:32.814	2026-04-17 04:40:32.814	13	\N	10	5	25	250	20	VND	t	0
1232	126	Vento Giày Sandal Thể Thao	Đen Tuyền	L	0	0	PV-126-V116	2026-04-17 04:40:32.909	2026-04-17 04:40:32.909	13	\N	1	5	25	250	20	VND	t	0
1233	126	Vento Giày Sandal Thể Thao	Xanh Rêu	XL	0	0	PV-126-V117	2026-04-17 04:40:33.283	2026-04-17 04:40:33.283	13	\N	7	5	25	250	20	VND	t	0
1234	126	Vento Giày Sandal Thể Thao	Hồng Pastel	XL	0	0	PV-126-V118	2026-04-17 04:40:33.599	2026-04-17 04:40:33.599	13	\N	8	5	25	250	20	VND	t	0
1235	126	Vento Giày Sandal Thể Thao	Nâu Đất	XL	0	0	PV-126-V119	2026-04-17 04:40:33.708	2026-04-17 04:40:33.708	13	\N	9	5	25	250	20	VND	t	0
1236	126	Vento Giày Sandal Thể Thao	Đen Tuyền	XL	0	0	PV-126-V120	2026-04-17 04:40:33.743	2026-04-17 04:40:33.743	13	\N	1	5	25	250	20	VND	t	0
1237	126	Vento Giày Sandal Thể Thao	Xanh Rêu	XXL	0	0	PV-126-V121	2026-04-17 04:40:34.05	2026-04-17 04:40:34.05	13	\N	7	5	25	250	20	VND	t	0
1242	128	Skechers Giày Tập Gym Êm Ái	Vàng Mù Tạt	S	0	0	PV-128-V105	2026-04-17 04:41:45.643	2026-04-17 04:41:45.643	13	\N	10	5	25	250	20	VND	t	0
1341	168	Outerity Áo Sweater Nỉ Bông	Trắng Basic	S	0	0	PV-168-V107	2026-04-17 04:50:40.69	2026-04-17 04:50:40.69	13	\N	2	5	25	250	20	VND	t	0
1365	152	Leonardo Thắt Lưng Da Miếng	Đỏ Đô	M	0	0	PV-152-V109	2026-04-17 04:53:48.181	2026-04-17 04:53:48.181	13	\N	3	5	25	250	20	VND	t	0
1367	152	Leonardo Thắt Lưng Da Miếng	Be (Cream)	M	0	0	PV-152-V111	2026-04-17 04:53:48.874	2026-04-17 04:53:48.874	13	\N	6	5	25	250	20	VND	t	0
1369	152	Leonardo Thắt Lưng Da Miếng	Đỏ Đô	L	0	0	PV-152-V113	2026-04-17 04:53:48.947	2026-04-17 04:53:48.947	13	\N	3	5	25	250	20	VND	t	0
1372	152	Leonardo Thắt Lưng Da Miếng	Xanh Rêu	L	0	0	PV-152-V116	2026-04-17 04:53:49.142	2026-04-17 04:53:49.142	13	\N	7	5	25	250	20	VND	t	0
1373	152	Leonardo Thắt Lưng Da Miếng	Đỏ Đô	XL	0	0	PV-152-V117	2026-04-17 04:53:49.227	2026-04-17 04:53:49.227	13	\N	3	5	25	250	20	VND	t	0
1374	152	Leonardo Thắt Lưng Da Miếng	Xanh Navy	XL	0	0	PV-152-V118	2026-04-17 04:53:49.372	2026-04-17 04:53:49.372	13	\N	4	5	25	250	20	VND	t	0
1375	152	Leonardo Thắt Lưng Da Miếng	Xám Khói	XL	0	0	PV-152-V119	2026-04-17 04:53:49.584	2026-04-17 04:53:49.584	13	\N	5	5	25	250	20	VND	t	0
1376	152	Leonardo Thắt Lưng Da Miếng	Xanh Rêu	XL	0	0	PV-152-V120	2026-04-17 04:53:49.709	2026-04-17 04:53:49.709	13	\N	7	5	25	250	20	VND	t	0
1377	152	Leonardo Thắt Lưng Da Miếng	Đỏ Đô	XXL	0	0	PV-152-V121	2026-04-17 04:53:49.846	2026-04-17 04:53:49.846	13	\N	3	5	25	250	20	VND	t	0
1378	152	Leonardo Thắt Lưng Da Miếng	Xanh Navy	XXL	0	0	PV-152-V122	2026-04-17 04:53:50.008	2026-04-17 04:53:50.008	13	\N	4	5	25	250	20	VND	t	0
1379	152	Leonardo Thắt Lưng Da Miếng	Xám Khói	XXL	0	0	PV-152-V123	2026-04-17 04:53:50.036	2026-04-17 04:53:50.036	13	\N	5	5	25	250	20	VND	t	0
1380	152	Leonardo Thắt Lưng Da Miếng	Be (Cream)	XXL	0	0	PV-152-V124	2026-04-17 04:53:50.157	2026-04-17 04:53:50.157	13	\N	6	5	25	250	20	VND	t	0
1382	153	KaLong Ví Da Bò Saffiano	Xanh Rêu	S	0	0	PV-153-V107	2026-04-17 04:54:59.416	2026-04-17 04:54:59.416	13	\N	7	5	25	250	20	VND	t	0
1384	153	KaLong Ví Da Bò Saffiano	Hồng Pastel	S	0	0	PV-153-V108	2026-04-17 04:54:59.44	2026-04-17 04:54:59.44	13	\N	8	5	25	250	20	VND	t	0
1385	153	KaLong Ví Da Bò Saffiano	Be (Cream)	S	0	0	PV-153-V106	2026-04-17 04:54:59.47	2026-04-17 04:54:59.47	13	\N	6	5	25	250	20	VND	t	0
1386	153	KaLong Ví Da Bò Saffiano	Be (Cream)	M	0	0	PV-153-V110	2026-04-17 04:55:00.318	2026-04-17 04:55:00.318	13	\N	6	5	25	250	20	VND	t	0
1387	153	KaLong Ví Da Bò Saffiano	Xanh Rêu	M	0	0	PV-153-V111	2026-04-17 04:55:00.36	2026-04-17 04:55:00.36	13	\N	7	5	25	250	20	VND	t	0
1062	102	Routine Quần Jean Slim Fit	Be (Cream)	38	0	0	PV-102-V107	2026-04-17 04:31:24.737	2026-04-17 04:31:24.737	13	\N	6	5	25	250	20	VND	t	0
1065	102	Routine Quần Jean Slim Fit	Đỏ Đô	39	0	0	PV-102-V109	2026-04-17 04:31:24.82	2026-04-17 04:31:24.82	13	\N	3	5	25	250	20	VND	t	0
1071	102	Routine Quần Jean Slim Fit	Be (Cream)	40	0	0	PV-102-V115	2026-04-17 04:31:25.732	2026-04-17 04:31:25.732	13	\N	6	5	25	250	20	VND	t	0
1072	102	Routine Quần Jean Slim Fit	Xanh Rêu	40	0	0	PV-102-V116	2026-04-17 04:31:25.934	2026-04-17 04:31:25.934	13	\N	7	5	25	250	20	VND	t	0
1074	102	Routine Quần Jean Slim Fit	Xanh Navy	41	0	0	PV-102-V118	2026-04-17 04:31:26.005	2026-04-17 04:31:26.005	13	\N	4	5	25	250	20	VND	t	0
1075	102	Routine Quần Jean Slim Fit	Xám Khói	41	0	0	PV-102-V119	2026-04-17 04:31:26.562	2026-04-17 04:31:26.562	13	\N	5	5	25	250	20	VND	t	0
1079	102	Routine Quần Jean Slim Fit	Xám Khói	42	0	0	PV-102-V123	2026-04-17 04:31:27.626	2026-04-17 04:31:27.626	13	\N	5	5	25	250	20	VND	t	0
1081	104	Copper Denim Quần Jean Baggy Nam	Hồng Pastel	38	0	0	PV-104-V107	2026-04-17 04:32:10.206	2026-04-17 04:32:10.206	13	\N	8	5	25	250	20	VND	t	0
1082	104	Copper Denim Quần Jean Baggy Nam	Be (Cream)	38	0	0	PV-104-V105	2026-04-17 04:32:10.215	2026-04-17 04:32:10.215	13	\N	6	5	25	250	20	VND	t	0
1084	104	Copper Denim Quần Jean Baggy Nam	Nâu Đất	38	0	0	PV-104-V108	2026-04-17 04:32:10.243	2026-04-17 04:32:10.243	13	\N	9	5	25	250	20	VND	t	0
1085	104	Copper Denim Quần Jean Baggy Nam	Xám Khói	39	0	0	PV-104-V109	2026-04-17 04:32:10.266	2026-04-17 04:32:10.266	13	\N	5	5	25	250	20	VND	t	0
1086	104	Copper Denim Quần Jean Baggy Nam	Xanh Rêu	39	0	0	PV-104-V110	2026-04-17 04:32:10.523	2026-04-17 04:32:10.523	13	\N	7	5	25	250	20	VND	t	0
1087	104	Copper Denim Quần Jean Baggy Nam	Hồng Pastel	39	0	0	PV-104-V111	2026-04-17 04:32:11.098	2026-04-17 04:32:11.098	13	\N	8	5	25	250	20	VND	t	0
1088	104	Copper Denim Quần Jean Baggy Nam	Nâu Đất	39	0	0	PV-104-V112	2026-04-17 04:32:11.205	2026-04-17 04:32:11.205	13	\N	9	5	25	250	20	VND	t	0
1090	104	Copper Denim Quần Jean Baggy Nam	Be (Cream)	40	0	0	PV-104-V114	2026-04-17 04:32:11.418	2026-04-17 04:32:11.418	13	\N	6	5	25	250	20	VND	t	0
1091	104	Copper Denim Quần Jean Baggy Nam	Hồng Pastel	40	0	0	PV-104-V115	2026-04-17 04:32:11.537	2026-04-17 04:32:11.537	13	\N	8	5	25	250	20	VND	t	0
1092	104	Copper Denim Quần Jean Baggy Nam	Nâu Đất	40	0	0	PV-104-V116	2026-04-17 04:32:12.079	2026-04-17 04:32:12.079	13	\N	9	5	25	250	20	VND	t	0
1093	104	Copper Denim Quần Jean Baggy Nam	Xám Khói	41	0	0	PV-104-V117	2026-04-17 04:32:12.236	2026-04-17 04:32:12.236	13	\N	5	5	25	250	20	VND	t	0
1094	104	Copper Denim Quần Jean Baggy Nam	Be (Cream)	41	0	0	PV-104-V118	2026-04-17 04:32:12.786	2026-04-17 04:32:12.786	13	\N	6	5	25	250	20	VND	t	0
1095	104	Copper Denim Quần Jean Baggy Nam	Xanh Rêu	41	0	0	PV-104-V119	2026-04-17 04:32:12.937	2026-04-17 04:32:12.937	13	\N	7	5	25	250	20	VND	t	0
1096	104	Copper Denim Quần Jean Baggy Nam	Nâu Đất	41	0	0	PV-104-V120	2026-04-17 04:32:13.611	2026-04-17 04:32:13.611	13	\N	9	5	25	250	20	VND	t	0
751	152	Leonardo Thắt Lưng Da Miếng	Đỏ Đô	S	119000	100	SKU-10-1-VAR1	2026-04-16 03:21:41.99	2026-04-17 04:53:48.182	1	\N	3	5	25	350	18	VND	t	0
752	152	Leonardo Thắt Lưng Da Miếng	Xanh Navy	M	119000	100	SKU-10-1-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:53:50.253	1	\N	4	5	25	350	18	VND	t	0
753	152	Leonardo Thắt Lưng Da Miếng	Xám Khói	L	119000	100	SKU-10-1-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:53:50.326	1	\N	5	5	25	350	18	VND	t	0
754	152	Leonardo Thắt Lưng Da Miếng	Be (Cream)	XL	119000	100	SKU-10-1-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:53:50.488	1	\N	6	5	25	350	18	VND	t	0
755	152	Leonardo Thắt Lưng Da Miếng	Xanh Rêu	XXL	119000	100	SKU-10-1-VAR5	2026-04-16 03:21:41.99	2026-04-17 04:53:50.624	1	\N	7	5	25	350	18	VND	t	0
756	153	KaLong Ví Da Bò Saffiano	Xanh Navy	S	139000	100	SKU-10-2-VAR1	2026-04-16 03:21:41.99	2026-04-17 04:54:59.42	1	\N	4	5	25	350	18	VND	t	0
757	153	KaLong Ví Da Bò Saffiano	Xám Khói	M	139000	100	SKU-10-2-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:55:01.784	1	\N	5	5	25	350	18	VND	t	0
758	153	KaLong Ví Da Bò Saffiano	Be (Cream)	L	139000	100	SKU-10-2-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:55:02.195	1	\N	6	5	25	350	18	VND	t	0
759	153	KaLong Ví Da Bò Saffiano	Xanh Rêu	XL	139000	100	SKU-10-2-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:55:02.464	1	\N	7	5	25	350	18	VND	t	0
760	153	KaLong Ví Da Bò Saffiano	Hồng Pastel	XXL	139000	100	SKU-10-2-VAR5	2026-04-16 03:21:41.99	2026-04-17 04:55:02.485	1	\N	8	5	25	350	18	VND	t	0
1097	104	Copper Denim Quần Jean Baggy Nam	Xám Khói	42	0	0	PV-104-V121	2026-04-17 04:32:14.134	2026-04-17 04:32:14.134	13	\N	5	5	25	250	20	VND	t	0
1098	104	Copper Denim Quần Jean Baggy Nam	Be (Cream)	42	0	0	PV-104-V122	2026-04-17 04:32:14.222	2026-04-17 04:32:14.222	13	\N	6	5	25	250	20	VND	t	0
1099	104	Copper Denim Quần Jean Baggy Nam	Xanh Rêu	42	0	0	PV-104-V123	2026-04-17 04:32:14.403	2026-04-17 04:32:14.403	13	\N	7	5	25	250	20	VND	t	0
1100	104	Copper Denim Quần Jean Baggy Nam	Hồng Pastel	42	0	0	PV-104-V124	2026-04-17 04:32:15.954	2026-04-17 04:32:15.954	13	\N	8	5	25	250	20	VND	t	0
1241	128	Skechers Giày Tập Gym Êm Ái	Trắng Basic	S	0	0	PV-128-V107	2026-04-17 04:41:45.641	2026-04-17 04:41:45.641	13	\N	2	5	25	250	20	VND	t	0
1243	128	Skechers Giày Tập Gym Êm Ái	Đen Tuyền	S	0	0	PV-128-V106	2026-04-17 04:41:45.655	2026-04-17 04:41:45.655	13	\N	1	5	25	250	20	VND	t	0
1265	132	LaForce Giày Oxford Da Bò	Xám Khói	S	0	0	PV-132-V106	2026-04-17 04:44:39.227	2026-04-17 04:44:39.227	13	\N	5	5	25	250	20	VND	t	0
1266	132	LaForce Giày Oxford Da Bò	Xám Khói	M	0	0	PV-132-V110	2026-04-17 04:44:39.641	2026-04-17 04:44:39.641	13	\N	5	5	25	250	20	VND	t	0
1267	132	LaForce Giày Oxford Da Bò	Be (Cream)	M	0	0	PV-132-V111	2026-04-17 04:44:40.026	2026-04-17 04:44:40.026	13	\N	6	5	25	250	20	VND	t	0
1268	132	LaForce Giày Oxford Da Bò	Xanh Rêu	M	0	0	PV-132-V112	2026-04-17 04:44:40.266	2026-04-17 04:44:40.266	13	\N	7	5	25	250	20	VND	t	0
1269	132	LaForce Giày Oxford Da Bò	Đỏ Đô	L	0	0	PV-132-V113	2026-04-17 04:44:40.475	2026-04-17 04:44:40.475	13	\N	3	5	25	250	20	VND	t	0
1342	168	Outerity Áo Sweater Nỉ Bông	Đen Tuyền	S	0	0	PV-168-V106	2026-04-17 04:50:40.7	2026-04-17 04:50:40.7	13	\N	1	5	25	250	20	VND	t	0
1345	168	Outerity Áo Sweater Nỉ Bông	Đỏ Đô	S	0	0	PV-168-V108	2026-04-17 04:50:40.725	2026-04-17 04:50:40.725	13	\N	3	5	25	250	20	VND	t	0
1346	168	Outerity Áo Sweater Nỉ Bông	Đen Tuyền	M	0	0	PV-168-V110	2026-04-17 04:50:40.996	2026-04-17 04:50:40.996	13	\N	1	5	25	250	20	VND	t	0
1355	168	Outerity Áo Sweater Nỉ Bông	Đen Tuyền	XL	0	0	PV-168-V119	2026-04-17 04:50:42.513	2026-04-17 04:50:42.513	13	\N	1	5	25	250	20	VND	t	0
1356	168	Outerity Áo Sweater Nỉ Bông	Đỏ Đô	XL	0	0	PV-168-V120	2026-04-17 04:50:42.539	2026-04-17 04:50:42.539	13	\N	3	5	25	250	20	VND	t	0
1357	168	Outerity Áo Sweater Nỉ Bông	Nâu Đất	XXL	0	0	PV-168-V121	2026-04-17 04:50:42.774	2026-04-17 04:50:42.774	13	\N	9	5	25	250	20	VND	t	0
1358	168	Outerity Áo Sweater Nỉ Bông	Vàng Mù Tạt	XXL	0	0	PV-168-V122	2026-04-17 04:50:42.904	2026-04-17 04:50:42.904	13	\N	10	5	25	250	20	VND	t	0
1359	168	Outerity Áo Sweater Nỉ Bông	Đen Tuyền	XXL	0	0	PV-168-V123	2026-04-17 04:50:43.084	2026-04-17 04:50:43.084	13	\N	1	5	25	250	20	VND	t	0
1360	168	Outerity Áo Sweater Nỉ Bông	Trắng Basic	XXL	0	0	PV-168-V124	2026-04-17 04:50:43.256	2026-04-17 04:50:43.256	13	\N	2	5	25	250	20	VND	t	0
1381	153	KaLong Ví Da Bò Saffiano	Xám Khói	S	0	0	PV-153-V105	2026-04-17 04:54:59.411	2026-04-17 04:54:59.411	13	\N	5	5	25	250	20	VND	t	0
1391	153	KaLong Ví Da Bò Saffiano	Xanh Rêu	L	0	0	PV-153-V115	2026-04-17 04:55:00.76	2026-04-17 04:55:00.76	13	\N	7	5	25	250	20	VND	t	0
1392	153	KaLong Ví Da Bò Saffiano	Hồng Pastel	L	0	0	PV-153-V116	2026-04-17 04:55:00.833	2026-04-17 04:55:00.833	13	\N	8	5	25	250	20	VND	t	0
1393	153	KaLong Ví Da Bò Saffiano	Xanh Navy	XL	0	0	PV-153-V117	2026-04-17 04:55:00.881	2026-04-17 04:55:00.881	13	\N	4	5	25	250	20	VND	t	0
1394	153	KaLong Ví Da Bò Saffiano	Xám Khói	XL	0	0	PV-153-V118	2026-04-17 04:55:01.19	2026-04-17 04:55:01.19	13	\N	5	5	25	250	20	VND	t	0
1395	153	KaLong Ví Da Bò Saffiano	Be (Cream)	XL	0	0	PV-153-V119	2026-04-17 04:55:01.276	2026-04-17 04:55:01.276	13	\N	6	5	25	250	20	VND	t	0
1396	153	KaLong Ví Da Bò Saffiano	Hồng Pastel	XL	0	0	PV-153-V120	2026-04-17 04:55:01.555	2026-04-17 04:55:01.555	13	\N	8	5	25	250	20	VND	t	0
1397	153	KaLong Ví Da Bò Saffiano	Xanh Navy	XXL	0	0	PV-153-V121	2026-04-17 04:55:01.593	2026-04-17 04:55:01.593	13	\N	4	5	25	250	20	VND	t	0
1398	153	KaLong Ví Da Bò Saffiano	Xám Khói	XXL	0	0	PV-153-V122	2026-04-17 04:55:01.753	2026-04-17 04:55:01.753	13	\N	5	5	25	250	20	VND	t	0
1399	153	KaLong Ví Da Bò Saffiano	Be (Cream)	XXL	0	0	PV-153-V123	2026-04-17 04:55:01.907	2026-04-17 04:55:01.907	13	\N	6	5	25	250	20	VND	t	0
1400	153	KaLong Ví Da Bò Saffiano	Xanh Rêu	XXL	0	0	PV-153-V124	2026-04-17 04:55:02.18	2026-04-17 04:55:02.18	13	\N	7	5	25	250	20	VND	t	0
1401	161	Owen Cà Vạt Lụa Cao Cấp	Đỏ Đô	S	0	0	PV-161-V105	2026-04-17 04:57:50.582	2026-04-17 04:57:50.582	13	\N	3	5	25	250	20	VND	t	0
1402	161	Owen Cà Vạt Lụa Cao Cấp	Xám Khói	S	0	0	PV-161-V107	2026-04-17 04:57:50.592	2026-04-17 04:57:50.592	13	\N	5	5	25	250	20	VND	t	0
1403	161	Owen Cà Vạt Lụa Cao Cấp	Xanh Navy	S	0	0	PV-161-V106	2026-04-17 04:57:50.598	2026-04-17 04:57:50.598	13	\N	4	5	25	250	20	VND	t	0
797	161	Owen Cà Vạt Lụa Cao Cấp	Đỏ Đô	M	299000	100	SKU-10-10-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:57:51.766	1	\N	3	5	25	350	18	VND	t	0
798	161	Owen Cà Vạt Lụa Cao Cấp	Xanh Navy	L	299000	100	SKU-10-10-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:57:52.184	1	\N	4	5	25	350	18	VND	t	0
799	161	Owen Cà Vạt Lụa Cao Cấp	Xám Khói	XL	299000	100	SKU-10-10-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:57:52.256	1	\N	5	5	25	350	18	VND	t	0
800	161	Owen Cà Vạt Lụa Cao Cấp	Be (Cream)	XXL	299000	100	SKU-10-10-VAR5	2026-04-16 03:21:41.99	2026-04-17 04:57:52.311	1	\N	6	5	25	350	18	VND	t	0
821	166	5theway Áo Hoodie Oversize	Xanh Rêu	S	575000	100	SKU-11-5-VAR1	2026-04-16 03:21:41.99	2026-04-17 04:49:39.989	1	\N	7	5	25	350	18	VND	t	0
822	166	5theway Áo Hoodie Oversize	Hồng Pastel	M	575000	100	SKU-11-5-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:49:43.4	1	\N	8	5	25	350	18	VND	t	0
823	166	5theway Áo Hoodie Oversize	Nâu Đất	L	575000	100	SKU-11-5-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:49:44.602	1	\N	9	5	25	350	18	VND	t	0
824	166	5theway Áo Hoodie Oversize	Vàng Mù Tạt	XL	575000	100	SKU-11-5-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:49:45.265	1	\N	10	5	25	350	18	VND	t	0
825	166	5theway Áo Hoodie Oversize	Đen Tuyền	XXL	575000	100	SKU-11-5-VAR5	2026-04-16 03:21:41.99	2026-04-17 04:49:45.301	1	\N	1	5	25	350	18	VND	t	0
831	168	Outerity Áo Sweater Nỉ Bông	Nâu Đất	S	625000	100	SKU-11-7-VAR1	2026-04-16 03:21:41.99	2026-04-17 04:50:40.702	1	\N	9	5	25	350	18	VND	t	0
832	168	Outerity Áo Sweater Nỉ Bông	Vàng Mù Tạt	M	625000	100	SKU-11-7-VAR2	2026-04-16 03:21:41.99	2026-04-17 04:50:43.389	1	\N	10	5	25	350	18	VND	t	0
833	168	Outerity Áo Sweater Nỉ Bông	Đen Tuyền	L	625000	100	SKU-11-7-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:50:43.551	1	\N	1	5	25	350	18	VND	t	0
834	168	Outerity Áo Sweater Nỉ Bông	Trắng Basic	XL	625000	100	SKU-11-7-VAR4	2026-04-16 03:21:41.99	2026-04-17 04:50:43.689	1	\N	2	5	25	350	18	VND	t	0
835	168	Outerity Áo Sweater Nỉ Bông	Đỏ Đô	XXL	625000	100	SKU-11-7-VAR5	2026-04-16 03:21:41.99	2026-04-17 04:50:43.818	1	\N	3	5	25	350	18	VND	t	0
1101	106	DirtyCoins Quần Jean Rách Gối	Hồng Pastel	38	0	0	PV-106-V105	2026-04-17 04:33:32.901	2026-04-17 04:33:32.901	13	\N	8	5	25	250	20	VND	t	0
1102	106	DirtyCoins Quần Jean Rách Gối	Vàng Mù Tạt	38	0	0	PV-106-V107	2026-04-17 04:33:32.913	2026-04-17 04:33:32.913	13	\N	10	5	25	250	20	VND	t	0
1105	106	DirtyCoins Quần Jean Rách Gối	Nâu Đất	38	0	0	PV-106-V106	2026-04-17 04:33:32.979	2026-04-17 04:33:32.979	13	\N	9	5	25	250	20	VND	t	0
1106	106	DirtyCoins Quần Jean Rách Gối	Vàng Mù Tạt	39	0	0	PV-106-V111	2026-04-17 04:33:33.779	2026-04-17 04:33:33.779	13	\N	10	5	25	250	20	VND	t	0
1107	106	DirtyCoins Quần Jean Rách Gối	Nâu Đất	39	0	0	PV-106-V110	2026-04-17 04:33:33.971	2026-04-17 04:33:33.971	13	\N	9	5	25	250	20	VND	t	0
1108	106	DirtyCoins Quần Jean Rách Gối	Đen Tuyền	39	0	0	PV-106-V112	2026-04-17 04:33:34.91	2026-04-17 04:33:34.91	13	\N	1	5	25	250	20	VND	t	0
1109	106	DirtyCoins Quần Jean Rách Gối	Xanh Rêu	40	0	0	PV-106-V113	2026-04-17 04:33:35.046	2026-04-17 04:33:35.046	13	\N	7	5	25	250	20	VND	t	0
1110	106	DirtyCoins Quần Jean Rách Gối	Hồng Pastel	40	0	0	PV-106-V114	2026-04-17 04:33:35.206	2026-04-17 04:33:35.206	13	\N	8	5	25	250	20	VND	t	0
1111	106	DirtyCoins Quần Jean Rách Gối	Vàng Mù Tạt	40	0	0	PV-106-V115	2026-04-17 04:33:35.346	2026-04-17 04:33:35.346	13	\N	10	5	25	250	20	VND	t	0
1112	106	DirtyCoins Quần Jean Rách Gối	Đen Tuyền	40	0	0	PV-106-V116	2026-04-17 04:33:35.658	2026-04-17 04:33:35.658	13	\N	1	5	25	250	20	VND	t	0
1114	106	DirtyCoins Quần Jean Rách Gối	Xanh Rêu	41	0	0	PV-106-V117	2026-04-17 04:33:36.748	2026-04-17 04:33:36.748	13	\N	7	5	25	250	20	VND	t	0
1115	106	DirtyCoins Quần Jean Rách Gối	Nâu Đất	41	0	0	PV-106-V119	2026-04-17 04:33:37.562	2026-04-17 04:33:37.562	13	\N	9	5	25	250	20	VND	t	0
1116	106	DirtyCoins Quần Jean Rách Gối	Đen Tuyền	41	0	0	PV-106-V120	2026-04-17 04:33:37.672	2026-04-17 04:33:37.672	13	\N	1	5	25	250	20	VND	t	0
1117	106	DirtyCoins Quần Jean Rách Gối	Xanh Rêu	42	0	0	PV-106-V121	2026-04-17 04:33:37.833	2026-04-17 04:33:37.833	13	\N	7	5	25	250	20	VND	t	0
1118	106	DirtyCoins Quần Jean Rách Gối	Hồng Pastel	42	0	0	PV-106-V122	2026-04-17 04:33:38.39	2026-04-17 04:33:38.39	13	\N	8	5	25	250	20	VND	t	0
1119	106	DirtyCoins Quần Jean Rách Gối	Nâu Đất	42	0	0	PV-106-V123	2026-04-17 04:33:38.51	2026-04-17 04:33:38.51	13	\N	9	5	25	250	20	VND	t	0
1120	106	DirtyCoins Quần Jean Rách Gối	Vàng Mù Tạt	42	0	0	PV-106-V124	2026-04-17 04:33:38.763	2026-04-17 04:33:38.763	13	\N	10	5	25	250	20	VND	t	0
635	128	Skechers Giày Tập Gym Êm Ái	Đỏ Đô	XXL	860000	100	SKU-7-7-VAR5	2026-04-16 03:21:41.99	2026-04-17 04:41:49.098	1	\N	3	5	25	350	18	VND	t	0
1261	132	LaForce Giày Oxford Da Bò	Xanh Navy	S	0	0	PV-132-V105	2026-04-17 04:44:39.093	2026-04-17 04:44:39.093	13	\N	4	5	25	250	20	VND	t	0
1262	132	LaForce Giày Oxford Da Bò	Be (Cream)	S	0	0	PV-132-V107	2026-04-17 04:44:39.121	2026-04-17 04:44:39.121	13	\N	6	5	25	250	20	VND	t	0
1263	132	LaForce Giày Oxford Da Bò	Xanh Rêu	S	0	0	PV-132-V108	2026-04-17 04:44:39.195	2026-04-17 04:44:39.195	13	\N	7	5	25	250	20	VND	t	0
1264	132	LaForce Giày Oxford Da Bò	Đỏ Đô	M	0	0	PV-132-V109	2026-04-17 04:44:39.202	2026-04-17 04:44:39.202	13	\N	3	5	25	250	20	VND	t	0
1270	132	LaForce Giày Oxford Da Bò	Xanh Navy	L	0	0	PV-132-V114	2026-04-17 04:44:40.57	2026-04-17 04:44:40.57	13	\N	4	5	25	250	20	VND	t	0
1271	132	LaForce Giày Oxford Da Bò	Be (Cream)	L	0	0	PV-132-V115	2026-04-17 04:44:40.585	2026-04-17 04:44:40.585	13	\N	6	5	25	250	20	VND	t	0
1272	132	LaForce Giày Oxford Da Bò	Xanh Rêu	L	0	0	PV-132-V116	2026-04-17 04:44:40.682	2026-04-17 04:44:40.682	13	\N	7	5	25	250	20	VND	t	0
1273	132	LaForce Giày Oxford Da Bò	Đỏ Đô	XL	0	0	PV-132-V117	2026-04-17 04:44:41.451	2026-04-17 04:44:41.451	13	\N	3	5	25	250	20	VND	t	0
1274	132	LaForce Giày Oxford Da Bò	Xanh Navy	XL	0	0	PV-132-V118	2026-04-17 04:44:41.613	2026-04-17 04:44:41.613	13	\N	4	5	25	250	20	VND	t	0
1275	132	LaForce Giày Oxford Da Bò	Xám Khói	XL	0	0	PV-132-V119	2026-04-17 04:44:42.585	2026-04-17 04:44:42.585	13	\N	5	5	25	250	20	VND	t	0
1276	132	LaForce Giày Oxford Da Bò	Xanh Rêu	XL	0	0	PV-132-V120	2026-04-17 04:44:42.681	2026-04-17 04:44:42.681	13	\N	7	5	25	250	20	VND	t	0
901	82	Coolmate Áo Thun Cotton Compact	Xanh Navy	S	0	0	PV-82-V105	2026-04-16 11:50:55.178	2026-04-16 11:50:55.178	13	\N	4	5	25	250	20	VND	t	0
902	82	Coolmate Áo Thun Cotton Compact	Be (Cream)	S	0	0	PV-82-V107	2026-04-16 11:50:55.197	2026-04-16 11:50:55.197	13	\N	6	5	25	250	20	VND	t	0
903	82	Coolmate Áo Thun Cotton Compact	Xanh Rêu	S	0	0	PV-82-V108	2026-04-16 11:50:55.247	2026-04-16 11:50:55.247	13	\N	7	5	25	250	20	VND	t	0
904	82	Coolmate Áo Thun Cotton Compact	Đỏ Đô	M	0	0	PV-82-V109	2026-04-16 11:50:55.27	2026-04-16 11:50:55.27	13	\N	3	5	25	250	20	VND	t	0
905	82	Coolmate Áo Thun Cotton Compact	Xám Khói	S	0	0	PV-82-V106	2026-04-16 11:50:55.278	2026-04-16 11:50:55.278	13	\N	5	5	25	250	20	VND	t	0
401	82	Coolmate Áo Thun Cotton Compact	Đỏ Đô	S	199000	100	SKU-3-1-VAR1	2026-04-16 03:21:41.99	2026-04-16 11:50:55.279	1	\N	3	5	25	350	18	VND	t	0
906	82	Coolmate Áo Thun Cotton Compact	Xám Khói	M	0	0	PV-82-V110	2026-04-16 11:50:57.533	2026-04-16 11:50:57.533	13	\N	5	5	25	250	20	VND	t	0
907	82	Coolmate Áo Thun Cotton Compact	Be (Cream)	M	0	0	PV-82-V111	2026-04-16 11:50:58.295	2026-04-16 11:50:58.295	13	\N	6	5	25	250	20	VND	t	0
908	82	Coolmate Áo Thun Cotton Compact	Xanh Rêu	M	0	0	PV-82-V112	2026-04-16 11:50:58.438	2026-04-16 11:50:58.438	13	\N	7	5	25	250	20	VND	t	0
909	82	Coolmate Áo Thun Cotton Compact	Đỏ Đô	L	0	0	PV-82-V113	2026-04-16 11:50:58.971	2026-04-16 11:50:58.971	13	\N	3	5	25	250	20	VND	t	0
910	82	Coolmate Áo Thun Cotton Compact	Xanh Navy	L	0	0	PV-82-V114	2026-04-16 11:51:01.786	2026-04-16 11:51:01.786	13	\N	4	5	25	250	20	VND	t	0
911	82	Coolmate Áo Thun Cotton Compact	Be (Cream)	L	0	0	PV-82-V115	2026-04-16 11:51:03.079	2026-04-16 11:51:03.079	13	\N	6	5	25	250	20	VND	t	0
912	82	Coolmate Áo Thun Cotton Compact	Xanh Rêu	L	0	0	PV-82-V116	2026-04-16 11:51:03.182	2026-04-16 11:51:03.182	13	\N	7	5	25	250	20	VND	t	0
913	82	Coolmate Áo Thun Cotton Compact	Đỏ Đô	XL	0	0	PV-82-V117	2026-04-16 11:51:05.239	2026-04-16 11:51:05.239	13	\N	3	5	25	250	20	VND	t	0
914	82	Coolmate Áo Thun Cotton Compact	Xanh Navy	XL	0	0	PV-82-V118	2026-04-16 11:51:05.395	2026-04-16 11:51:05.395	13	\N	4	5	25	250	20	VND	t	0
915	82	Coolmate Áo Thun Cotton Compact	Xám Khói	XL	0	0	PV-82-V119	2026-04-16 11:51:06.548	2026-04-16 11:51:06.548	13	\N	5	5	25	250	20	VND	t	0
916	82	Coolmate Áo Thun Cotton Compact	Xanh Rêu	XL	0	0	PV-82-V120	2026-04-16 11:51:07.048	2026-04-16 11:51:07.048	13	\N	7	5	25	250	20	VND	t	0
917	82	Coolmate Áo Thun Cotton Compact	Đỏ Đô	XXL	0	0	PV-82-V121	2026-04-16 11:51:07.069	2026-04-16 11:51:07.069	13	\N	3	5	25	250	20	VND	t	0
918	82	Coolmate Áo Thun Cotton Compact	Xanh Navy	XXL	0	0	PV-82-V122	2026-04-16 11:51:07.965	2026-04-16 11:51:07.965	13	\N	4	5	25	250	20	VND	t	0
919	82	Coolmate Áo Thun Cotton Compact	Xám Khói	XXL	0	0	PV-82-V123	2026-04-16 11:51:08.817	2026-04-16 11:51:08.817	13	\N	5	5	25	250	20	VND	t	0
920	82	Coolmate Áo Thun Cotton Compact	Be (Cream)	XXL	0	0	PV-82-V124	2026-04-16 11:51:09.622	2026-04-16 11:51:09.622	13	\N	6	5	25	250	20	VND	t	0
921	84	Levents Áo Thun Oversize Graphic	Be (Cream)	S	0	0	PV-84-V105	2026-04-17 00:43:22.105	2026-04-17 00:43:22.105	13	\N	6	5	25	250	20	VND	t	0
922	84	Levents Áo Thun Oversize Graphic	Hồng Pastel	S	0	0	PV-84-V107	2026-04-17 00:43:22.119	2026-04-17 00:43:22.119	13	\N	8	5	25	250	20	VND	t	0
923	84	Levents Áo Thun Oversize Graphic	Xanh Rêu	S	0	0	PV-84-V106	2026-04-17 00:43:22.18	2026-04-17 00:43:22.18	13	\N	7	5	25	250	20	VND	t	0
924	84	Levents Áo Thun Oversize Graphic	Nâu Đất	S	0	0	PV-84-V108	2026-04-17 00:43:22.194	2026-04-17 00:43:22.194	13	\N	9	5	25	250	20	VND	t	0
925	84	Levents Áo Thun Oversize Graphic	Xám Khói	M	0	0	PV-84-V109	2026-04-17 00:43:22.252	2026-04-17 00:43:22.252	13	\N	5	5	25	250	20	VND	t	0
926	84	Levents Áo Thun Oversize Graphic	Xanh Rêu	M	0	0	PV-84-V110	2026-04-17 00:43:23.878	2026-04-17 00:43:23.878	13	\N	7	5	25	250	20	VND	t	0
927	84	Levents Áo Thun Oversize Graphic	Hồng Pastel	M	0	0	PV-84-V111	2026-04-17 00:43:25.272	2026-04-17 00:43:25.272	13	\N	8	5	25	250	20	VND	t	0
928	84	Levents Áo Thun Oversize Graphic	Nâu Đất	M	0	0	PV-84-V112	2026-04-17 00:43:26.267	2026-04-17 00:43:26.267	13	\N	9	5	25	250	20	VND	t	0
929	84	Levents Áo Thun Oversize Graphic	Xám Khói	L	0	0	PV-84-V113	2026-04-17 00:43:26.638	2026-04-17 00:43:26.638	13	\N	5	5	25	250	20	VND	t	0
930	84	Levents Áo Thun Oversize Graphic	Be (Cream)	L	0	0	PV-84-V114	2026-04-17 00:43:27.029	2026-04-17 00:43:27.029	13	\N	6	5	25	250	20	VND	t	0
931	84	Levents Áo Thun Oversize Graphic	Hồng Pastel	L	0	0	PV-84-V115	2026-04-17 00:43:27.281	2026-04-17 00:43:27.281	13	\N	8	5	25	250	20	VND	t	0
932	84	Levents Áo Thun Oversize Graphic	Nâu Đất	L	0	0	PV-84-V116	2026-04-17 00:43:28.965	2026-04-17 00:43:28.965	13	\N	9	5	25	250	20	VND	t	0
933	84	Levents Áo Thun Oversize Graphic	Xám Khói	XL	0	0	PV-84-V117	2026-04-17 00:43:29.092	2026-04-17 00:43:29.092	13	\N	5	5	25	250	20	VND	t	0
934	84	Levents Áo Thun Oversize Graphic	Be (Cream)	XL	0	0	PV-84-V118	2026-04-17 00:43:29.806	2026-04-17 00:43:29.806	13	\N	6	5	25	250	20	VND	t	0
935	84	Levents Áo Thun Oversize Graphic	Xanh Rêu	XL	0	0	PV-84-V119	2026-04-17 00:43:30.114	2026-04-17 00:43:30.114	13	\N	7	5	25	250	20	VND	t	0
936	84	Levents Áo Thun Oversize Graphic	Nâu Đất	XL	0	0	PV-84-V120	2026-04-17 00:43:31.444	2026-04-17 00:43:31.444	13	\N	9	5	25	250	20	VND	t	0
937	84	Levents Áo Thun Oversize Graphic	Xám Khói	XXL	0	0	PV-84-V121	2026-04-17 00:43:32.501	2026-04-17 00:43:32.501	13	\N	5	5	25	250	20	VND	t	0
938	84	Levents Áo Thun Oversize Graphic	Be (Cream)	XXL	0	0	PV-84-V122	2026-04-17 00:43:33.007	2026-04-17 00:43:33.007	13	\N	6	5	25	250	20	VND	t	0
939	84	Levents Áo Thun Oversize Graphic	Xanh Rêu	XXL	0	0	PV-84-V123	2026-04-17 00:43:33.267	2026-04-17 00:43:33.267	13	\N	7	5	25	250	20	VND	t	0
940	84	Levents Áo Thun Oversize Graphic	Hồng Pastel	XXL	0	0	PV-84-V124	2026-04-17 00:43:34.826	2026-04-17 00:43:34.826	13	\N	8	5	25	250	20	VND	t	0
941	85	DirtyCoins Áo Polo Pique Pro	Xanh Rêu	S	0	0	PV-85-V105	2026-04-17 00:46:41.446	2026-04-17 00:46:41.446	13	\N	7	5	25	250	20	VND	t	0
942	85	DirtyCoins Áo Polo Pique Pro	Nâu Đất	S	0	0	PV-85-V107	2026-04-17 00:46:41.473	2026-04-17 00:46:41.473	13	\N	9	5	25	250	20	VND	t	0
943	85	DirtyCoins Áo Polo Pique Pro	Hồng Pastel	S	0	0	PV-85-V106	2026-04-17 00:46:41.486	2026-04-17 00:46:41.486	13	\N	8	5	25	250	20	VND	t	0
944	85	DirtyCoins Áo Polo Pique Pro	Vàng Mù Tạt	S	0	0	PV-85-V108	2026-04-17 00:46:41.498	2026-04-17 00:46:41.498	13	\N	10	5	25	250	20	VND	t	0
945	85	DirtyCoins Áo Polo Pique Pro	Be (Cream)	M	0	0	PV-85-V109	2026-04-17 00:46:41.523	2026-04-17 00:46:41.523	13	\N	6	5	25	250	20	VND	t	0
946	85	DirtyCoins Áo Polo Pique Pro	Hồng Pastel	M	0	0	PV-85-V110	2026-04-17 00:46:42.722	2026-04-17 00:46:42.722	13	\N	8	5	25	250	20	VND	t	0
947	85	DirtyCoins Áo Polo Pique Pro	Nâu Đất	M	0	0	PV-85-V111	2026-04-17 00:46:42.793	2026-04-17 00:46:42.793	13	\N	9	5	25	250	20	VND	t	0
948	85	DirtyCoins Áo Polo Pique Pro	Vàng Mù Tạt	M	0	0	PV-85-V112	2026-04-17 00:46:43.614	2026-04-17 00:46:43.614	13	\N	10	5	25	250	20	VND	t	0
949	85	DirtyCoins Áo Polo Pique Pro	Be (Cream)	L	0	0	PV-85-V113	2026-04-17 00:46:43.662	2026-04-17 00:46:43.662	13	\N	6	5	25	250	20	VND	t	0
950	85	DirtyCoins Áo Polo Pique Pro	Xanh Rêu	L	0	0	PV-85-V114	2026-04-17 00:46:44.713	2026-04-17 00:46:44.713	13	\N	7	5	25	250	20	VND	t	0
951	85	DirtyCoins Áo Polo Pique Pro	Nâu Đất	L	0	0	PV-85-V115	2026-04-17 00:46:44.918	2026-04-17 00:46:44.918	13	\N	9	5	25	250	20	VND	t	0
952	85	DirtyCoins Áo Polo Pique Pro	Vàng Mù Tạt	L	0	0	PV-85-V116	2026-04-17 00:46:45.663	2026-04-17 00:46:45.663	13	\N	10	5	25	250	20	VND	t	0
953	85	DirtyCoins Áo Polo Pique Pro	Be (Cream)	XL	0	0	PV-85-V117	2026-04-17 00:46:45.778	2026-04-17 00:46:45.778	13	\N	6	5	25	250	20	VND	t	0
954	85	DirtyCoins Áo Polo Pique Pro	Xanh Rêu	XL	0	0	PV-85-V118	2026-04-17 00:46:45.895	2026-04-17 00:46:45.895	13	\N	7	5	25	250	20	VND	t	0
955	85	DirtyCoins Áo Polo Pique Pro	Hồng Pastel	XL	0	0	PV-85-V119	2026-04-17 00:46:46.129	2026-04-17 00:46:46.129	13	\N	8	5	25	250	20	VND	t	0
956	85	DirtyCoins Áo Polo Pique Pro	Vàng Mù Tạt	XL	0	0	PV-85-V120	2026-04-17 00:46:46.466	2026-04-17 00:46:46.466	13	\N	10	5	25	250	20	VND	t	0
957	85	DirtyCoins Áo Polo Pique Pro	Be (Cream)	XXL	0	0	PV-85-V121	2026-04-17 00:46:47.729	2026-04-17 00:46:47.729	13	\N	6	5	25	250	20	VND	t	0
958	85	DirtyCoins Áo Polo Pique Pro	Xanh Rêu	XXL	0	0	PV-85-V122	2026-04-17 00:46:48.45	2026-04-17 00:46:48.45	13	\N	7	5	25	250	20	VND	t	0
959	85	DirtyCoins Áo Polo Pique Pro	Hồng Pastel	XXL	0	0	PV-85-V123	2026-04-17 00:46:49.599	2026-04-17 00:46:49.599	13	\N	8	5	25	250	20	VND	t	0
960	85	DirtyCoins Áo Polo Pique Pro	Nâu Đất	XXL	0	0	PV-85-V124	2026-04-17 00:46:50.148	2026-04-17 00:46:50.148	13	\N	9	5	25	250	20	VND	t	0
961	86	SSStutter Áo Thun Basic Tee	Hồng Pastel	S	0	0	PV-86-V105	2026-04-17 00:55:58.42	2026-04-17 00:55:58.42	13	\N	8	5	25	250	20	VND	t	0
962	86	SSStutter Áo Thun Basic Tee	Vàng Mù Tạt	S	0	0	PV-86-V107	2026-04-17 00:55:58.437	2026-04-17 00:55:58.437	13	\N	10	5	25	250	20	VND	t	0
963	86	SSStutter Áo Thun Basic Tee	Đen Tuyền	S	0	0	PV-86-V108	2026-04-17 00:55:58.45	2026-04-17 00:55:58.45	13	\N	1	5	25	250	20	VND	t	0
964	86	SSStutter Áo Thun Basic Tee	Xanh Rêu	M	0	0	PV-86-V109	2026-04-17 00:55:58.481	2026-04-17 00:55:58.481	13	\N	7	5	25	250	20	VND	t	0
965	86	SSStutter Áo Thun Basic Tee	Nâu Đất	M	0	0	PV-86-V110	2026-04-17 00:55:58.525	2026-04-17 00:55:58.525	13	\N	9	5	25	250	20	VND	t	0
966	86	SSStutter Áo Thun Basic Tee	Vàng Mù Tạt	M	0	0	PV-86-V111	2026-04-17 00:55:59.471	2026-04-17 00:55:59.471	13	\N	10	5	25	250	20	VND	t	0
967	86	SSStutter Áo Thun Basic Tee	Đen Tuyền	M	0	0	PV-86-V112	2026-04-17 00:56:01.037	2026-04-17 00:56:01.037	13	\N	1	5	25	250	20	VND	t	0
968	86	SSStutter Áo Thun Basic Tee	Xanh Rêu	L	0	0	PV-86-V113	2026-04-17 00:56:01.804	2026-04-17 00:56:01.804	13	\N	7	5	25	250	20	VND	t	0
969	86	SSStutter Áo Thun Basic Tee	Hồng Pastel	L	0	0	PV-86-V114	2026-04-17 00:56:02.013	2026-04-17 00:56:02.013	13	\N	8	5	25	250	20	VND	t	0
970	86	SSStutter Áo Thun Basic Tee	Nâu Đất	S	0	0	PV-86-V106	2026-04-17 00:56:02.485	2026-04-17 00:56:02.485	13	\N	9	5	25	250	20	VND	t	0
971	86	SSStutter Áo Thun Basic Tee	Vàng Mù Tạt	L	0	0	PV-86-V115	2026-04-17 00:56:02.612	2026-04-17 00:56:02.612	13	\N	10	5	25	250	20	VND	t	0
972	86	SSStutter Áo Thun Basic Tee	Đen Tuyền	L	0	0	PV-86-V116	2026-04-17 00:56:02.863	2026-04-17 00:56:02.863	13	\N	1	5	25	250	20	VND	t	0
973	86	SSStutter Áo Thun Basic Tee	Xanh Rêu	XL	0	0	PV-86-V117	2026-04-17 00:56:04.03	2026-04-17 00:56:04.03	13	\N	7	5	25	250	20	VND	t	0
974	86	SSStutter Áo Thun Basic Tee	Hồng Pastel	XL	0	0	PV-86-V118	2026-04-17 00:56:04.296	2026-04-17 00:56:04.296	13	\N	8	5	25	250	20	VND	t	0
975	86	SSStutter Áo Thun Basic Tee	Nâu Đất	XL	0	0	PV-86-V119	2026-04-17 00:56:04.342	2026-04-17 00:56:04.342	13	\N	9	5	25	250	20	VND	t	0
976	86	SSStutter Áo Thun Basic Tee	Đen Tuyền	XL	0	0	PV-86-V120	2026-04-17 00:56:04.907	2026-04-17 00:56:04.907	13	\N	1	5	25	250	20	VND	t	0
977	86	SSStutter Áo Thun Basic Tee	Xanh Rêu	XXL	0	0	PV-86-V121	2026-04-17 00:56:05.05	2026-04-17 00:56:05.05	13	\N	7	5	25	250	20	VND	t	0
978	86	SSStutter Áo Thun Basic Tee	Hồng Pastel	XXL	0	0	PV-86-V122	2026-04-17 00:56:06.317	2026-04-17 00:56:06.317	13	\N	8	5	25	250	20	VND	t	0
979	86	SSStutter Áo Thun Basic Tee	Nâu Đất	XXL	0	0	PV-86-V123	2026-04-17 00:56:06.404	2026-04-17 00:56:06.404	13	\N	9	5	25	250	20	VND	t	0
980	86	SSStutter Áo Thun Basic Tee	Vàng Mù Tạt	XXL	0	0	PV-86-V124	2026-04-17 00:56:07.091	2026-04-17 00:56:07.091	13	\N	10	5	25	250	20	VND	t	0
1121	112	Owen Quần Tây Slim Fit	Xanh Navy	38	0	0	PV-112-V105	2026-04-17 04:34:44.345	2026-04-17 04:34:44.345	13	\N	4	5	25	250	20	VND	t	0
1123	112	Owen Quần Tây Slim Fit	Xám Khói	38	0	0	PV-112-V106	2026-04-17 04:34:44.36	2026-04-17 04:34:44.36	13	\N	5	5	25	250	20	VND	t	0
1124	112	Owen Quần Tây Slim Fit	Xanh Rêu	38	0	0	PV-112-V108	2026-04-17 04:34:44.367	2026-04-17 04:34:44.367	13	\N	7	5	25	250	20	VND	t	0
1127	112	Owen Quần Tây Slim Fit	Be (Cream)	39	0	0	PV-112-V111	2026-04-17 04:34:44.942	2026-04-17 04:34:44.942	13	\N	6	5	25	250	20	VND	t	0
1141	113	Aristino Quần Kaki Chino Basic	Xám Khói	38	0	0	PV-113-V105	2026-04-17 04:35:25.806	2026-04-17 04:35:25.806	13	\N	5	5	25	250	20	VND	t	0
1143	113	Aristino Quần Kaki Chino Basic	Be (Cream)	38	0	0	PV-113-V106	2026-04-17 04:35:25.819	2026-04-17 04:35:25.819	13	\N	6	5	25	250	20	VND	t	0
1145	113	Aristino Quần Kaki Chino Basic	Xanh Navy	39	0	0	PV-113-V109	2026-04-17 04:35:25.829	2026-04-17 04:35:25.829	13	\N	4	5	25	250	20	VND	t	0
1147	113	Aristino Quần Kaki Chino Basic	Xanh Rêu	39	0	0	PV-113-V111	2026-04-17 04:35:26.161	2026-04-17 04:35:26.161	13	\N	7	5	25	250	20	VND	t	0
1150	113	Aristino Quần Kaki Chino Basic	Xám Khói	40	0	0	PV-113-V114	2026-04-17 04:35:26.43	2026-04-17 04:35:26.43	13	\N	5	5	25	250	20	VND	t	0
1152	113	Aristino Quần Kaki Chino Basic	Hồng Pastel	40	0	0	PV-113-V116	2026-04-17 04:35:26.457	2026-04-17 04:35:26.457	13	\N	8	5	25	250	20	VND	t	0
1153	113	Aristino Quần Kaki Chino Basic	Xanh Navy	41	0	0	PV-113-V117	2026-04-17 04:35:26.511	2026-04-17 04:35:26.511	13	\N	4	5	25	250	20	VND	t	0
1154	113	Aristino Quần Kaki Chino Basic	Xám Khói	41	0	0	PV-113-V118	2026-04-17 04:35:26.561	2026-04-17 04:35:26.561	13	\N	5	5	25	250	20	VND	t	0
1155	113	Aristino Quần Kaki Chino Basic	Be (Cream)	41	0	0	PV-113-V119	2026-04-17 04:35:26.723	2026-04-17 04:35:26.723	13	\N	6	5	25	250	20	VND	t	0
1159	113	Aristino Quần Kaki Chino Basic	Be (Cream)	42	0	0	PV-113-V123	2026-04-17 04:35:26.894	2026-04-17 04:35:26.894	13	\N	6	5	25	250	20	VND	t	0
1176	83	Routine Áo Polo Excool	Xanh Rêu	L	0	0	PV-83-V120	2026-04-17 04:35:56.813	2026-04-17 04:35:56.813	13	\N	7	5	25	250	20	VND	t	0
1178	83	Routine Áo Polo Excool	Xám Khói	XL	0	0	PV-83-V122	2026-04-17 04:35:56.837	2026-04-17 04:35:56.837	13	\N	5	5	25	250	20	VND	t	0
1180	83	Routine Áo Polo Excool	Be (Cream)	XL	0	0	PV-83-V124	2026-04-17 04:35:56.882	2026-04-17 04:35:56.882	13	\N	6	5	25	250	20	VND	t	0
408	83	Routine Áo Polo Excool	Be (Cream)	L	209000	100	SKU-3-2-VAR3	2026-04-16 03:21:41.99	2026-04-17 04:35:56.919	1	\N	6	5	25	350	18	VND	t	0
1181	114	Routine Quần Tây Âu Lịch Sự	Be (Cream)	38	0	0	PV-114-V105	2026-04-17 04:37:40.744	2026-04-17 04:37:40.744	13	\N	6	5	25	250	20	VND	t	0
1183	114	Routine Quần Tây Âu Lịch Sự	Xám Khói	39	0	0	PV-114-V109	2026-04-17 04:37:40.756	2026-04-17 04:37:40.756	13	\N	5	5	25	250	20	VND	t	0
1184	114	Routine Quần Tây Âu Lịch Sự	Nâu Đất	38	0	0	PV-114-V108	2026-04-17 04:37:40.769	2026-04-17 04:37:40.769	13	\N	9	5	25	250	20	VND	t	0
1185	114	Routine Quần Tây Âu Lịch Sự	Xanh Rêu	38	0	0	PV-114-V106	2026-04-17 04:37:40.809	2026-04-17 04:37:40.809	13	\N	7	5	25	250	20	VND	t	0
1186	114	Routine Quần Tây Âu Lịch Sự	Xanh Rêu	39	0	0	PV-114-V110	2026-04-17 04:37:41.052	2026-04-17 04:37:41.052	13	\N	7	5	25	250	20	VND	t	0
1187	114	Routine Quần Tây Âu Lịch Sự	Hồng Pastel	39	0	0	PV-114-V111	2026-04-17 04:37:41.069	2026-04-17 04:37:41.069	13	\N	8	5	25	250	20	VND	t	0
1188	114	Routine Quần Tây Âu Lịch Sự	Nâu Đất	39	0	0	PV-114-V112	2026-04-17 04:37:41.129	2026-04-17 04:37:41.129	13	\N	9	5	25	250	20	VND	t	0
1189	114	Routine Quần Tây Âu Lịch Sự	Xám Khói	40	0	0	PV-114-V113	2026-04-17 04:37:41.31	2026-04-17 04:37:41.31	13	\N	5	5	25	250	20	VND	t	0
1190	114	Routine Quần Tây Âu Lịch Sự	Be (Cream)	40	0	0	PV-114-V114	2026-04-17 04:37:41.378	2026-04-17 04:37:41.378	13	\N	6	5	25	250	20	VND	t	0
1192	114	Routine Quần Tây Âu Lịch Sự	Nâu Đất	40	0	0	PV-114-V116	2026-04-17 04:37:41.587	2026-04-17 04:37:41.587	13	\N	9	5	25	250	20	VND	t	0
1277	132	LaForce Giày Oxford Da Bò	Đỏ Đô	XXL	0	0	PV-132-V121	2026-04-17 04:44:43.008	2026-04-17 04:44:43.008	13	\N	3	5	25	250	20	VND	t	0
1278	132	LaForce Giày Oxford Da Bò	Xanh Navy	XXL	0	0	PV-132-V122	2026-04-17 04:44:43.441	2026-04-17 04:44:43.441	13	\N	4	5	25	250	20	VND	t	0
1279	132	LaForce Giày Oxford Da Bò	Xám Khói	XXL	0	0	PV-132-V123	2026-04-17 04:44:43.852	2026-04-17 04:44:43.852	13	\N	5	5	25	250	20	VND	t	0
1280	132	LaForce Giày Oxford Da Bò	Be (Cream)	XXL	0	0	PV-132-V124	2026-04-17 04:44:44.386	2026-04-17 04:44:44.386	13	\N	6	5	25	250	20	VND	t	0
1343	168	Outerity Áo Sweater Nỉ Bông	Vàng Mù Tạt	S	0	0	PV-168-V105	2026-04-17 04:50:40.679	2026-04-17 04:50:40.679	13	\N	10	5	25	250	20	VND	t	0
1344	168	Outerity Áo Sweater Nỉ Bông	Nâu Đất	M	0	0	PV-168-V109	2026-04-17 04:50:40.722	2026-04-17 04:50:40.722	13	\N	9	5	25	250	20	VND	t	0
981	87	Outerity Áo Thun Local Brand	Nâu Đất	S	0	0	PV-87-V105	2026-04-17 00:58:02.943	2026-04-17 00:58:02.943	13	\N	9	5	25	250	20	VND	t	0
982	87	Outerity Áo Thun Local Brand	Đen Tuyền	S	0	0	PV-87-V107	2026-04-17 00:58:02.962	2026-04-17 00:58:02.962	13	\N	1	5	25	250	20	VND	t	0
983	87	Outerity Áo Thun Local Brand	Vàng Mù Tạt	S	0	0	PV-87-V106	2026-04-17 00:58:02.999	2026-04-17 00:58:02.999	13	\N	10	5	25	250	20	VND	t	0
984	87	Outerity Áo Thun Local Brand	Trắng Basic	S	0	0	PV-87-V108	2026-04-17 00:58:03.026	2026-04-17 00:58:03.026	13	\N	2	5	25	250	20	VND	t	0
985	87	Outerity Áo Thun Local Brand	Hồng Pastel	M	0	0	PV-87-V109	2026-04-17 00:58:03.066	2026-04-17 00:58:03.066	13	\N	8	5	25	250	20	VND	t	0
986	87	Outerity Áo Thun Local Brand	Vàng Mù Tạt	M	0	0	PV-87-V110	2026-04-17 00:58:03.654	2026-04-17 00:58:03.654	13	\N	10	5	25	250	20	VND	t	0
987	87	Outerity Áo Thun Local Brand	Đen Tuyền	M	0	0	PV-87-V111	2026-04-17 00:58:03.817	2026-04-17 00:58:03.817	13	\N	1	5	25	250	20	VND	t	0
988	87	Outerity Áo Thun Local Brand	Trắng Basic	M	0	0	PV-87-V112	2026-04-17 00:58:05.998	2026-04-17 00:58:05.998	13	\N	2	5	25	250	20	VND	t	0
989	87	Outerity Áo Thun Local Brand	Hồng Pastel	L	0	0	PV-87-V113	2026-04-17 00:58:06.208	2026-04-17 00:58:06.208	13	\N	8	5	25	250	20	VND	t	0
990	87	Outerity Áo Thun Local Brand	Nâu Đất	L	0	0	PV-87-V114	2026-04-17 00:58:06.569	2026-04-17 00:58:06.569	13	\N	9	5	25	250	20	VND	t	0
991	87	Outerity Áo Thun Local Brand	Đen Tuyền	L	0	0	PV-87-V115	2026-04-17 00:58:06.903	2026-04-17 00:58:06.903	13	\N	1	5	25	250	20	VND	t	0
992	87	Outerity Áo Thun Local Brand	Trắng Basic	L	0	0	PV-87-V116	2026-04-17 00:58:06.948	2026-04-17 00:58:06.948	13	\N	2	5	25	250	20	VND	t	0
993	87	Outerity Áo Thun Local Brand	Hồng Pastel	XL	0	0	PV-87-V117	2026-04-17 00:58:07.251	2026-04-17 00:58:07.251	13	\N	8	5	25	250	20	VND	t	0
994	87	Outerity Áo Thun Local Brand	Nâu Đất	XL	0	0	PV-87-V118	2026-04-17 00:58:07.576	2026-04-17 00:58:07.576	13	\N	9	5	25	250	20	VND	t	0
995	87	Outerity Áo Thun Local Brand	Vàng Mù Tạt	XL	0	0	PV-87-V119	2026-04-17 00:58:08.869	2026-04-17 00:58:08.869	13	\N	10	5	25	250	20	VND	t	0
996	87	Outerity Áo Thun Local Brand	Trắng Basic	XL	0	0	PV-87-V120	2026-04-17 00:58:08.977	2026-04-17 00:58:08.977	13	\N	2	5	25	250	20	VND	t	0
997	87	Outerity Áo Thun Local Brand	Hồng Pastel	XXL	0	0	PV-87-V121	2026-04-17 00:58:09.554	2026-04-17 00:58:09.554	13	\N	8	5	25	250	20	VND	t	0
998	87	Outerity Áo Thun Local Brand	Nâu Đất	XXL	0	0	PV-87-V122	2026-04-17 00:58:09.706	2026-04-17 00:58:09.706	13	\N	9	5	25	250	20	VND	t	0
999	87	Outerity Áo Thun Local Brand	Vàng Mù Tạt	XXL	0	0	PV-87-V123	2026-04-17 00:58:10.037	2026-04-17 00:58:10.037	13	\N	10	5	25	250	20	VND	t	0
1000	87	Outerity Áo Thun Local Brand	Đen Tuyền	XXL	0	0	PV-87-V124	2026-04-17 00:58:11.216	2026-04-17 00:58:11.216	13	\N	1	5	25	250	20	VND	t	0
1122	112	Owen Quần Tây Slim Fit	Be (Cream)	38	0	0	PV-112-V107	2026-04-17 04:34:44.353	2026-04-17 04:34:44.353	13	\N	6	5	25	250	20	VND	t	0
1132	112	Owen Quần Tây Slim Fit	Xanh Rêu	40	0	0	PV-112-V116	2026-04-17 04:34:45.359	2026-04-17 04:34:45.359	13	\N	7	5	25	250	20	VND	t	0
1133	112	Owen Quần Tây Slim Fit	Đỏ Đô	41	0	0	PV-112-V117	2026-04-17 04:34:45.372	2026-04-17 04:34:45.372	13	\N	3	5	25	250	20	VND	t	0
1134	112	Owen Quần Tây Slim Fit	Xanh Navy	41	0	0	PV-112-V118	2026-04-17 04:34:45.38	2026-04-17 04:34:45.38	13	\N	4	5	25	250	20	VND	t	0
1135	112	Owen Quần Tây Slim Fit	Xám Khói	41	0	0	PV-112-V119	2026-04-17 04:34:45.51	2026-04-17 04:34:45.51	13	\N	5	5	25	250	20	VND	t	0
1136	112	Owen Quần Tây Slim Fit	Xanh Rêu	41	0	0	PV-112-V120	2026-04-17 04:34:45.61	2026-04-17 04:34:45.61	13	\N	7	5	25	250	20	VND	t	0
1137	112	Owen Quần Tây Slim Fit	Đỏ Đô	42	0	0	PV-112-V121	2026-04-17 04:34:45.672	2026-04-17 04:34:45.672	13	\N	3	5	25	250	20	VND	t	0
1138	112	Owen Quần Tây Slim Fit	Xanh Navy	42	0	0	PV-112-V122	2026-04-17 04:34:45.718	2026-04-17 04:34:45.718	13	\N	4	5	25	250	20	VND	t	0
1139	112	Owen Quần Tây Slim Fit	Xám Khói	42	0	0	PV-112-V123	2026-04-17 04:34:45.777	2026-04-17 04:34:45.777	13	\N	5	5	25	250	20	VND	t	0
1146	113	Aristino Quần Kaki Chino Basic	Be (Cream)	39	0	0	PV-113-V110	2026-04-17 04:35:26.111	2026-04-17 04:35:26.111	13	\N	6	5	25	250	20	VND	t	0
1148	113	Aristino Quần Kaki Chino Basic	Hồng Pastel	39	0	0	PV-113-V112	2026-04-17 04:35:26.166	2026-04-17 04:35:26.166	13	\N	8	5	25	250	20	VND	t	0
1149	113	Aristino Quần Kaki Chino Basic	Xanh Navy	40	0	0	PV-113-V113	2026-04-17 04:35:26.329	2026-04-17 04:35:26.329	13	\N	4	5	25	250	20	VND	t	0
1281	136	Zapatos Giày Chelsea Boots	Hồng Pastel	S	0	0	PV-136-V105	2026-04-17 04:45:38.669	2026-04-17 04:45:38.669	13	\N	8	5	25	250	20	VND	t	0
1283	136	Zapatos Giày Chelsea Boots	Nâu Đất	S	0	0	PV-136-V106	2026-04-17 04:45:38.708	2026-04-17 04:45:38.708	13	\N	9	5	25	250	20	VND	t	0
1284	136	Zapatos Giày Chelsea Boots	Đen Tuyền	S	0	0	PV-136-V108	2026-04-17 04:45:38.715	2026-04-17 04:45:38.715	13	\N	1	5	25	250	20	VND	t	0
1285	136	Zapatos Giày Chelsea Boots	Xanh Rêu	M	0	0	PV-136-V109	2026-04-17 04:45:38.741	2026-04-17 04:45:38.741	13	\N	7	5	25	250	20	VND	t	0
1286	136	Zapatos Giày Chelsea Boots	Nâu Đất	M	0	0	PV-136-V110	2026-04-17 04:45:39.226	2026-04-17 04:45:39.226	13	\N	9	5	25	250	20	VND	t	0
1287	136	Zapatos Giày Chelsea Boots	Vàng Mù Tạt	M	0	0	PV-136-V111	2026-04-17 04:45:39.528	2026-04-17 04:45:39.528	13	\N	10	5	25	250	20	VND	t	0
1288	136	Zapatos Giày Chelsea Boots	Đen Tuyền	M	0	0	PV-136-V112	2026-04-17 04:45:39.861	2026-04-17 04:45:39.861	13	\N	1	5	25	250	20	VND	t	0
1289	136	Zapatos Giày Chelsea Boots	Xanh Rêu	L	0	0	PV-136-V113	2026-04-17 04:45:40.034	2026-04-17 04:45:40.034	13	\N	7	5	25	250	20	VND	t	0
796	161	Owen Cà Vạt Lụa Cao Cấp	Trắng Basic	S	299000	100	SKU-10-10-VAR1	2026-04-16 03:21:41.99	2026-04-17 04:57:50.6	1	\N	2	5	25	350	18	VND	t	0
1406	161	Owen Cà Vạt Lụa Cao Cấp	Xanh Navy	M	0	0	PV-161-V110	2026-04-17 04:57:50.974	2026-04-17 04:57:50.974	13	\N	4	5	25	250	20	VND	t	0
1407	161	Owen Cà Vạt Lụa Cao Cấp	Xám Khói	M	0	0	PV-161-V111	2026-04-17 04:57:50.991	2026-04-17 04:57:50.991	13	\N	5	5	25	250	20	VND	t	0
1408	161	Owen Cà Vạt Lụa Cao Cấp	Be (Cream)	M	0	0	PV-161-V112	2026-04-17 04:57:51.06	2026-04-17 04:57:51.06	13	\N	6	5	25	250	20	VND	t	0
1409	161	Owen Cà Vạt Lụa Cao Cấp	Trắng Basic	L	0	0	PV-161-V113	2026-04-17 04:57:51.068	2026-04-17 04:57:51.068	13	\N	2	5	25	250	20	VND	t	0
1410	161	Owen Cà Vạt Lụa Cao Cấp	Đỏ Đô	L	0	0	PV-161-V114	2026-04-17 04:57:51.278	2026-04-17 04:57:51.278	13	\N	3	5	25	250	20	VND	t	0
1411	161	Owen Cà Vạt Lụa Cao Cấp	Xám Khói	L	0	0	PV-161-V115	2026-04-17 04:57:51.351	2026-04-17 04:57:51.351	13	\N	5	5	25	250	20	VND	t	0
1412	161	Owen Cà Vạt Lụa Cao Cấp	Be (Cream)	L	0	0	PV-161-V116	2026-04-17 04:57:51.411	2026-04-17 04:57:51.411	13	\N	6	5	25	250	20	VND	t	0
1414	161	Owen Cà Vạt Lụa Cao Cấp	Đỏ Đô	XL	0	0	PV-161-V118	2026-04-17 04:57:51.511	2026-04-17 04:57:51.511	13	\N	3	5	25	250	20	VND	t	0
1415	161	Owen Cà Vạt Lụa Cao Cấp	Xanh Navy	XL	0	0	PV-161-V119	2026-04-17 04:57:51.563	2026-04-17 04:57:51.563	13	\N	4	5	25	250	20	VND	t	0
1416	161	Owen Cà Vạt Lụa Cao Cấp	Be (Cream)	XL	0	0	PV-161-V120	2026-04-17 04:57:51.801	2026-04-17 04:57:51.801	13	\N	6	5	25	250	20	VND	t	0
1417	161	Owen Cà Vạt Lụa Cao Cấp	Trắng Basic	XXL	0	0	PV-161-V121	2026-04-17 04:57:51.821	2026-04-17 04:57:51.821	13	\N	2	5	25	250	20	VND	t	0
1419	161	Owen Cà Vạt Lụa Cao Cấp	Xanh Navy	XXL	0	0	PV-161-V123	2026-04-17 04:57:51.901	2026-04-17 04:57:51.901	13	\N	4	5	25	250	20	VND	t	0
1420	161	Owen Cà Vạt Lụa Cao Cấp	Xám Khói	XXL	0	0	PV-161-V124	2026-04-17 04:57:52.053	2026-04-17 04:57:52.053	13	\N	5	5	25	250	20	VND	t	0
1404	161	Owen Cà Vạt Lụa Cao Cấp	Be (Cream)	S	0	0	PV-161-V108	2026-04-17 04:57:50.607	2026-04-17 04:57:50.607	13	\N	6	5	25	250	20	VND	t	0
1405	161	Owen Cà Vạt Lụa Cao Cấp	Trắng Basic	M	0	0	PV-161-V109	2026-04-17 04:57:50.641	2026-04-17 04:57:50.641	13	\N	2	5	25	250	20	VND	t	0
1413	161	Owen Cà Vạt Lụa Cao Cấp	Trắng Basic	XL	0	0	PV-161-V117	2026-04-17 04:57:51.498	2026-04-17 04:57:51.498	13	\N	2	5	25	250	20	VND	t	0
1418	161	Owen Cà Vạt Lụa Cao Cấp	Đỏ Đô	XXL	0	0	PV-161-V122	2026-04-17 04:57:51.879	2026-04-17 04:57:51.879	13	\N	3	5	25	250	20	VND	t	0
407	83	Routine Áo Polo Excool	Xám Khói	M	209000	99	SKU-3-2-VAR2	2026-04-16 03:21:41.99	2026-04-22 07:46:31.911	1	\N	5	5	25	350	18	VND	t	1
606	123	Ananas Giày Slip-on Basic	Xanh Navy	S	710000	99	SKU-7-2-VAR1	2026-04-16 03:21:41.99	2026-04-22 09:47:27.316	1	\N	4	5	25	350	18	VND	t	1
705	142	MLB Nón Kết NY Yankees	Xanh Rêu	XXL	155000	100	SKU-9-1-VAR5	2026-04-16 03:21:41.99	2026-04-22 10:10:00.045	1	\N	7	5	25	350	18	VND	t	0
456	93	Aristino Sơ Mi Flannel Kẻ Caro	Xanh Navy	S	380000	99	SKU-4-2-VAR1	2026-04-16 03:21:41.99	2026-04-22 09:53:36.858	1	\N	4	5	25	350	18	VND	t	1
425	86	SSStutter Áo Thun Basic Tee	Đen Tuyền	XXL	239000	99	SKU-3-5-VAR5	2026-04-16 03:21:41.99	2026-04-22 09:56:17.664	1	\N	1	5	25	350	18	VND	t	1
\.


--
-- TOC entry 3884 (class 0 OID 18006)
-- Dependencies: 245
-- Data for Name: Products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Products" (id, name, description, price, "stockKeepingUnit", stock, "categoryId", "createdAt", "updatedAt", "createByUserId", "voucherId", "currencyUnit") FROM stdin;
94	Routine Sơ Mi Bamboo Kháng Khuẩn	Sản phẩm Routine Sơ Mi Bamboo Kháng Khuẩn thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-4-3	500	4	2026-04-16 03:21:41.99	2026-04-17 04:30:01.397	1	\N	VND
104	Copper Denim Quần Jean Baggy Nam	Sản phẩm Copper Denim Quần Jean Baggy Nam thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-5-3	500	5	2026-04-16 03:21:41.99	2026-04-17 04:32:09.59	1	\N	VND
106	DirtyCoins Quần Jean Rách Gối	Sản phẩm DirtyCoins Quần Jean Rách Gối thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-5-5	500	5	2026-04-16 03:21:41.99	2026-04-17 04:33:32.388	1	\N	VND
85	DirtyCoins Áo Polo Pique Pro	Sản phẩm DirtyCoins Áo Polo Pique Pro thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-3-4	500	3	2026-04-16 03:21:41.99	2026-04-17 00:46:40.134	1	\N	VND
87	Outerity Áo Thun Local Brand	Sản phẩm Outerity Áo Thun Local Brand thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-3-6	500	3	2026-04-16 03:21:41.99	2026-04-17 00:57:57.454	1	\N	VND
112	Owen Quần Tây Slim Fit	Sản phẩm Owen Quần Tây Slim Fit thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-6-1	500	6	2026-04-16 03:21:41.99	2026-04-17 04:34:43.87	1	\N	VND
113	Aristino Quần Kaki Chino Basic	Sản phẩm Aristino Quần Kaki Chino Basic thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-6-2	500	6	2026-04-16 03:21:41.99	2026-04-17 04:35:25.275	1	\N	VND
114	Routine Quần Tây Âu Lịch Sự	Sản phẩm Routine Quần Tây Âu Lịch Sự thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-6-3	500	6	2026-04-16 03:21:41.99	2026-04-17 04:37:40.37	1	\N	VND
126	Vento Giày Sandal Thể Thao	Sản phẩm Vento Giày Sandal Thể Thao thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-7-5	500	7	2026-04-16 03:21:41.99	2026-04-17 04:40:30.855	1	\N	VND
128	Skechers Giày Tập Gym Êm Ái	Sản phẩm Skechers Giày Tập Gym Êm Ái thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-7-7	500	7	2026-04-16 03:21:41.99	2026-04-17 04:41:45.126	1	\N	VND
132	LaForce Giày Oxford Da Bò	Sản phẩm LaForce Giày Oxford Da Bò thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-8-1	500	8	2026-04-16 03:21:41.99	2026-04-17 04:44:36.234	1	\N	VND
136	Zapatos Giày Chelsea Boots	Sản phẩm Zapatos Giày Chelsea Boots thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-8-5	500	8	2026-04-16 03:21:41.99	2026-04-17 04:45:38.167	1	\N	VND
152	Leonardo Thắt Lưng Da Miếng	Sản phẩm Leonardo Thắt Lưng Da Miếng thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-10-1	500	10	2026-04-16 03:21:41.99	2026-04-17 04:53:47.484	1	\N	VND
153	KaLong Ví Da Bò Saffiano	Sản phẩm KaLong Ví Da Bò Saffiano thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-10-2	500	10	2026-04-16 03:21:41.99	2026-04-17 04:54:58.797	1	\N	VND
166	5theway Áo Hoodie Oversize	Sản phẩm 5theway Áo Hoodie Oversize thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-11-5	500	11	2026-04-16 03:21:41.99	2026-04-17 04:49:38.703	1	\N	VND
168	Outerity Áo Sweater Nỉ Bông	Sản phẩm Outerity Áo Sweater Nỉ Bông thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-11-7	500	11	2026-04-16 03:21:41.99	2026-04-17 04:50:40.276	1	\N	VND
161	Owen Cà Vạt Lụa Cao Cấp	Sản phẩm Owen Cà Vạt Lụa Cao Cấp thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-10-10	500	10	2026-04-16 03:21:41.99	2026-04-17 04:57:50.187	1	\N	VND
84	Levents Áo Thun Oversize Graphic	Sản phẩm Levents Áo Thun Oversize Graphic thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-3-3	498	3	2026-04-16 03:21:41.99	2026-04-22 09:13:09.923	1	\N	VND
102	Routine Quần Jean Slim Fit	Sản phẩm Routine Quần Jean Slim Fit thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-5-1	499	5	2026-04-16 03:21:41.99	2026-04-22 09:46:48.778	1	\N	VND
123	Ananas Giày Slip-on Basic	Sản phẩm Ananas Giày Slip-on Basic thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-7-2	499	7	2026-04-16 03:21:41.99	2026-04-22 09:47:27.318	1	\N	VND
93	Aristino Sơ Mi Flannel Kẻ Caro	Sản phẩm Aristino Sơ Mi Flannel Kẻ Caro thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-4-2	499	4	2026-04-16 03:21:41.99	2026-04-22 09:53:36.867	1	\N	VND
92	Owen Sơ Mi Trắng Công Sở	Sản phẩm Owen Sơ Mi Trắng Công Sở thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-4-1	499	4	2026-04-16 03:21:41.99	2026-04-22 09:54:24.09	1	\N	VND
86	SSStutter Áo Thun Basic Tee	Sản phẩm SSStutter Áo Thun Basic Tee thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-3-5	499	3	2026-04-16 03:21:41.99	2026-04-22 09:56:17.67	1	\N	VND
142	MLB Nón Kết NY Yankees	Sản phẩm MLB Nón Kết NY Yankees thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-9-1	500	9	2026-04-16 03:21:41.99	2026-04-22 10:10:00.049	1	\N	VND
82	Coolmate Áo Thun Cotton Compact	Sản phẩm Coolmate Áo Thun Cotton Compact thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-3-1	495	3	2026-04-16 03:21:41.99	2026-04-22 08:04:55.09	1	\N	VND
83	Routine Áo Polo Excool	Sản phẩm Routine Áo Polo Excool thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-3-2	498	3	2026-04-16 03:21:41.99	2026-04-24 15:28:33.489	1	\N	VND
\.


--
-- TOC entry 3886 (class 0 OID 18014)
-- Dependencies: 247
-- Data for Name: Requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Requests" (id, "orderId", description, status, "createdAt", "updatedAt", "userId", "processByStaffId", subject) FROM stdin;
1	39	màu áo này không đúng với mô tả sản phẩm	PENDING	2026-04-22 09:22:38.829	2026-04-22 09:22:38.829	11	\N	RETURN_REQUEST
2	45	Refund request for order ID 45 after delivery failed	PENDING	2026-04-22 09:57:30.821	2026-04-22 09:57:30.821	11	\N	RETURN_REQUEST
\.


--
-- TOC entry 3888 (class 0 OID 18023)
-- Dependencies: 249
-- Data for Name: ReturnRequests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReturnRequests" (id, "requestId", "createdAt", "updatedAt", "bankAccountName", "bankAccountNumber", "bankName") FROM stdin;
1	1	2026-04-22 09:22:38.834	2026-04-22 09:22:38.834	VO MAI PHUONG	077145203963	AGRIBANK
2	2	2026-04-22 09:57:30.824	2026-04-22 09:57:30.824	\N	\N	\N
\.


--
-- TOC entry 3890 (class 0 OID 18028)
-- Dependencies: 251
-- Data for Name: Reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Reviews" (id, "productId", "productVariantId", rating, comment, "createdAt", "updatedAt", "userId") FROM stdin;
\.


--
-- TOC entry 3892 (class 0 OID 18035)
-- Dependencies: 253
-- Data for Name: RoomChat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RoomChat" (id, name, description, "isPrivate", "createdAt", "updatedAt") FROM stdin;
1	support-12	Phuong Vo Mai	f	2026-04-16 10:52:51.353	2026-04-16 10:52:51.353
\.


--
-- TOC entry 3894 (class 0 OID 18043)
-- Dependencies: 255
-- Data for Name: ShipmentItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShipmentItems" (id, "shipmentId", "orderItemId", "createdAt", "updatedAt") FROM stdin;
1	1	1	2026-04-22 07:46:31.956	2026-04-22 07:46:31.956
34	34	34	2026-04-22 08:04:55.269	2026-04-22 08:04:55.269
35	35	35	2026-04-22 08:08:55.692	2026-04-22 08:08:55.692
36	36	36	2026-04-22 08:10:53.343	2026-04-22 08:10:53.343
37	37	37	2026-04-22 08:16:05.762	2026-04-22 08:16:05.762
38	38	38	2026-04-22 08:32:34.654	2026-04-22 08:32:34.654
39	39	39	2026-04-22 09:13:09.941	2026-04-22 09:13:09.941
40	40	40	2026-04-22 09:46:48.796	2026-04-22 09:46:48.796
41	41	41	2026-04-22 09:47:27.331	2026-04-22 09:47:27.331
42	42	42	2026-04-22 09:50:41.6	2026-04-22 09:50:41.6
43	43	43	2026-04-22 09:53:36.887	2026-04-22 09:53:36.887
44	44	44	2026-04-22 09:54:24.109	2026-04-22 09:54:24.109
45	45	45	2026-04-22 09:56:17.686	2026-04-22 09:56:17.686
46	46	46	2026-04-24 15:28:33.567	2026-04-24 15:28:33.567
\.


--
-- TOC entry 3896 (class 0 OID 18048)
-- Dependencies: 257
-- Data for Name: Shipments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Shipments" (id, "orderId", "estimatedDelivery", "deliveredAt", "estimatedShipDate", "shippedAt", carrier, "trackingNumber", status, "createdAt", "updatedAt", "processByStaffId", "ghnOrderCode", description, "ghnPickShiftId") FROM stdin;
46	46	2026-04-26 16:59:59	\N	2026-04-25 15:28:33.553	\N	Giao hàng nhanh	LH8V4Y	PENDING	2026-04-24 15:28:33.556	2026-04-24 15:28:35.163	\N	LH8V4Y		\N
1	1	2026-04-23 16:59:59	2026-04-22 08:02:24.797	2026-04-23 07:46:31.95	2026-04-22 08:01:55.577	Giao hàng nhanh	LHAGMP	DELIVERED	2026-04-22 07:46:31.951	2026-04-22 08:02:24.798	13	LHAGMP	Giao cho bảo vệ tòa nhà nếu người nhận đi vắng	3
34	34	2026-04-23 16:59:59	2026-04-22 08:06:07.08	2026-04-23 08:04:55.257	2026-04-22 08:05:45.385	Giao hàng nhanh	LHAU6M	DELIVERED	2026-04-22 08:04:55.259	2026-04-22 08:06:07.081	13	LHAU6M	Giao cho bảo vệ tòa nhà	4
35	35	2026-04-23 16:59:59	\N	2026-04-23 08:08:55.685	\N	Giao hàng nhanh	LHAUDY	CANCELLED	2026-04-22 08:08:55.686	2026-04-22 08:10:01.161	\N	LHAUDY		\N
36	36	2026-04-23 16:59:59	\N	2026-04-23 08:10:53.34	\N	Giao hàng nhanh	LHAUDE	CANCELLED	2026-04-22 08:10:53.341	2026-04-22 08:13:21.804	\N	LHAUDE		\N
37	37	2026-04-23 16:59:59	\N	2026-04-23 08:16:05.759	\N	Giao hàng nhanh	LHAUB8	CANCELLED	2026-04-22 08:16:05.76	2026-04-22 08:20:00.444	\N	LHAUB8		\N
38	38	2026-04-23 16:59:59	\N	2026-04-23 08:32:34.648	\N	Giao hàng nhanh	LHAUYL	CANCELLED	2026-04-22 08:32:34.65	2026-04-22 09:05:00.558	\N	LHAUYL		\N
39	39	2026-04-23 16:59:59	2026-04-22 09:21:51.151	2026-04-23 09:13:09.937	2026-04-22 09:21:48.936	Giao hàng nhanh	LHACBF	DELIVERED	2026-04-22 09:13:09.939	2026-04-22 09:21:51.153	13	LHACBF		5
41	41	2026-04-23 16:59:59	\N	2026-04-23 09:47:27.328	2026-04-22 09:48:51.712	Giao hàng nhanh	LHACEQ	SHIPPED	2026-04-22 09:47:27.329	2026-04-22 09:48:51.713	13	LHACEQ		6
40	40	2026-04-23 16:59:59	\N	2026-04-23 09:46:48.789	2026-04-22 09:49:02.857	Giao hàng nhanh	LHACMF	SHIPPED	2026-04-22 09:46:48.792	2026-04-22 09:49:02.859	13	LHACMF		7
44	44	2026-04-23 16:59:59	\N	2026-04-23 09:54:24.104	\N	Giao hàng nhanh	LHA9FN	WAITING_FOR_PICKUP	2026-04-22 09:54:24.105	2026-04-22 09:55:25.132	13	LHA9FN		8
43	43	2026-04-23 16:59:59	\N	2026-04-23 09:53:36.879	\N	Giao hàng nhanh	LHA9LW	WAITING_FOR_PICKUP	2026-04-22 09:53:36.881	2026-04-22 09:55:30.795	13	LHA9LW		9
45	45	2026-04-23 16:59:59	2026-04-22 09:57:30.817	2026-04-23 09:56:17.681	2026-04-22 09:57:29.536	Giao hàng nhanh	LHA97K	DELIVERED_FAILED	2026-04-22 09:56:17.684	2026-04-22 09:57:30.818	13	LHA97K		10
42	42	2026-04-23 16:59:59	\N	2026-04-23 09:50:41.596	\N	Giao hàng nhanh	LHA9QF	CANCELLED	2026-04-22 09:50:41.597	2026-04-22 10:10:00.058	\N	LHA9QF		\N
\.


--
-- TOC entry 3898 (class 0 OID 18056)
-- Dependencies: 259
-- Data for Name: SizeProfiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SizeProfiles" (id, "heightCm", "weightKg", "chestCm", "hipCm", "sleeveLengthCm", "inseamCm", "shoulderLengthCm", "bodyType", description, "createdAt", "updatedAt", "userId") FROM stdin;
\.


--
-- TOC entry 3900 (class 0 OID 18070)
-- Dependencies: 261
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, "createdAt", "updatedAt", email, phone, "firstName", "lastName", role, password, username, "codeActive", "codeActiveExpire", "isActive", gender, points, "loyaltyCard", "staffCode", "googleId") FROM stdin;
1	2026-04-16 02:46:56.924	2026-04-16 02:46:56.924	admin@fashion.com	0901234567	Hùng	Nguyễn Mạnh	ADMIN	hash_pw_123	admin_boss	39bd1059-51a9-4744-81bc-ced4d06c790c	2027-04-16 02:46:56.924	t	MALE	1000	\N	\N	\N
2	2026-04-16 02:46:56.924	2026-04-16 02:46:56.924	lan.operator@fashion.com	0912345678	Lan	Trần Thị	OPERATOR	hash_pw_123	lan_staff	a36fc802-e4d2-43dc-978b-9049488aecd0	2027-04-16 02:46:56.924	t	FEMALE	0	\N	\N	\N
3	2026-04-16 02:46:56.924	2026-04-16 02:46:56.924	minh.customer@gmail.com	0987654321	Minh	Lê Quang	USER	hash_pw_123	minh_q9	ea0c240e-bd93-403d-825b-2d7ef40ab2b0	2027-04-16 02:46:56.924	t	MALE	50	\N	\N	\N
4	2026-04-16 02:46:56.924	2026-04-16 02:46:56.924	hong.pham@gmail.com	0933445566	Hồng	Phạm Diệu	USER	hash_pw_123	hong_fashion	c3e56f07-8e95-4e5a-ac2f-f6e4234cfcf5	2027-04-16 02:46:56.924	t	FEMALE	120	\N	\N	\N
5	2026-04-16 02:46:56.924	2026-04-16 02:46:56.924	tuan.vu@gmail.com	0944556677	Tuấn	Vũ Anh	USER	hash_pw_123	tuan_sneaker	413ff80f-e691-4cf8-b25d-75639fbeb748	2027-04-16 02:46:56.924	t	MALE	80	\N	\N	\N
6	2026-04-16 02:46:56.924	2026-04-16 02:46:56.924	vy.hoang@gmail.com	0955667788	Vy	Hoàng Thảo	USER	hash_pw_123	vy_boutique	37273967-bffe-4623-ad29-a7f8f06a4943	2027-04-16 02:46:56.924	t	FEMALE	200	\N	\N	\N
7	2026-04-16 02:46:56.924	2026-04-16 02:46:56.924	duy.dang@gmail.com	0966778899	Duy	Đặng Khắc	USER	hash_pw_123	duy_streetwear	915b7ac7-7c96-4979-887a-ce0ac9da81c8	2027-04-16 02:46:56.924	t	MALE	15	\N	\N	\N
8	2026-04-16 02:46:56.924	2026-04-16 02:46:56.924	anh.bui@gmail.com	0977889900	Anh	Bùi Ngọc	USER	hash_pw_123	anh_ngoc_99	1592179c-06e0-4f23-965f-1474f3f05a6f	2027-04-16 02:46:56.924	t	FEMALE	300	\N	\N	\N
9	2026-04-16 02:46:56.924	2026-04-16 02:46:56.924	thinh.truong@gmail.com	0988990011	Thịnh	Trương Gia	USER	hash_pw_123	thinh_gia_92	9256d3ca-edfb-41aa-bb3c-37605a189c92	2027-04-16 02:46:56.924	t	MALE	45	\N	\N	\N
10	2026-04-16 02:46:56.924	2026-04-16 02:46:56.924	mai.do@gmail.com	0999001122	Mai	Đỗ Tuyết	USER	hash_pw_123	mai_tuyet_clothing	6d950131-b71b-4081-82d6-31e318b4bf7e	2027-04-16 02:46:56.924	t	FEMALE	10	\N	\N	\N
11	2026-04-16 10:24:22.613	2026-04-16 10:26:47.225	maiphuongbrt9a1@gmail.com		Vo	Phuong	USER	$2b$10$b4lREQiiOwlG5gjXIc82WeeiavwDpHc4aS/8z6SsP8BrAO82O4Dia	VoPhuong62688	a1f9ecac-3a74-4c1e-8f6e-89003277c2e9	2026-04-16 10:29:22.613	t	OTHER	0	\N	\N	\N
13	2026-04-16 11:43:46.703	2026-04-22 07:59:27.74	vomaiphuonghhvt@gmail.com	1234567890	Phuong	Vo Mai	ADMIN	$2b$10$V.McqY1skT1ygUli3alEwO2UnxnMxulldvJaaNd0nC/z4Upeh.ABa	VoMaiPhuong465465	f93f6558-27e9-4cc6-b443-029a28b8eb99	2026-04-16 11:48:46.705	t	MALE	0	\N	\N	\N
\.


--
-- TOC entry 3901 (class 0 OID 18080)
-- Dependencies: 262
-- Data for Name: UserRoomChat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserRoomChat" ("userId", "roomChatId", "joinedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3902 (class 0 OID 18085)
-- Dependencies: 263
-- Data for Name: UserVouchers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserVouchers" (id, "voucherId", "useVoucherAt", "saveVoucherAt", "voucherStatus", "userId", "createdAt", "updatedAt", "orderId") FROM stdin;
\.


--
-- TOC entry 3905 (class 0 OID 18093)
-- Dependencies: 266
-- Data for Name: Vouchers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Vouchers" (id, code, description, "discountType", "discountValue", "validFrom", "validTo", "usageLimit", "timesUsed", "isActive", "createdAt", "createdBy", "updatedAt", "isOverUsageLimit") FROM stdin;
10	SUMMER2026	Chào hè rực rỡ 2026	PERCENTAGE	15	2026-04-16 02:58:30.736	2026-08-31 00:00:00	2000	0	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
11	FASHIONNEW	Ưu đãi bộ sưu tập mới	FIXED_AMOUNT	40000	2026-04-16 02:58:30.736	2026-12-31 00:00:00	1000	0	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
12	VIPMEMBER	Dành riêng cho khách hàng thân thiết	PERCENTAGE	10	2026-04-16 02:58:30.736	2027-01-01 00:00:00	9999	0	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
13	FREESHIP_MAX	Mã miễn phí vận chuyển Extra	FIXED_AMOUNT	30000	2026-04-16 02:58:30.736	2026-05-01 00:00:00	5000	0	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
14	COUPON50K	Giảm trực tiếp 50k đơn từ 400k	FIXED_AMOUNT	50000	2026-04-16 02:58:30.736	2026-06-30 00:00:00	300	0	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
15	THOITRANG12	Sale giữa tháng 12/12	PERCENTAGE	12	2026-04-16 02:58:30.736	2026-12-20 00:00:00	1212	0	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
16	MYGIFT	Quà tặng bất ngờ cho bạn	FIXED_AMOUNT	20000	2026-04-16 02:58:30.736	2026-12-31 00:00:00	500	0	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
17	HOLIDAY	Chào mừng đại lễ	PERCENTAGE	30	2026-04-16 02:58:30.736	2026-05-10 00:00:00	1000	0	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
18	APPONLY	Ưu đãi khi mua trên App	FIXED_AMOUNT	25000	2026-04-16 02:58:30.736	2026-12-31 00:00:00	2000	0	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
19	WELCOME	Chào mừng thành viên mới	PERCENTAGE	5	2026-04-16 02:58:30.736	2026-12-31 00:00:00	10000	0	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
20	STREETSTYLE	Phong cách đường phố bùng nổ	FIXED_AMOUNT	35000	2026-04-16 02:58:30.736	2026-07-01 00:00:00	400	0	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
1	LUNAR2024	Mừng Tết Giáp Thìn 2024	FIXED_AMOUNT	50000	2024-01-01 00:00:00	2024-02-15 00:00:00	1000	1000	f	2026-04-16 02:58:30.736	1	2026-04-18 10:18:00.773	t
2	WINTER23	Xả kho mùa đông 2023	PERCENTAGE	20	2023-11-01 00:00:00	2023-12-31 00:00:00	500	500	f	2026-04-16 02:58:30.736	1	2026-04-18 10:18:01.012	t
3	BLACKFRIDAY	Siêu sale Black Friday	PERCENTAGE	50	2023-11-20 00:00:00	2023-11-30 00:00:00	2000	2000	f	2026-04-16 02:58:30.736	1	2026-04-18 10:18:01.022	t
4	OPENING	Chào mừng khai trương shop	FIXED_AMOUNT	100000	2023-10-01 00:00:00	2023-10-31 00:00:00	100	100	f	2026-04-16 02:58:30.736	1	2026-04-18 10:18:01.061	t
5	FREESHIP0D	Miễn phí vận chuyển đơn 0đ tháng 1	FIXED_AMOUNT	15000	2024-01-01 00:00:00	2024-01-31 00:00:00	5000	5000	f	2026-04-16 02:58:30.736	1	2026-04-18 10:18:01.094	t
6	VALENTINE24	Lễ tình nhân ngọt ngào	PERCENTAGE	14	2024-02-10 00:00:00	2024-02-16 00:00:00	214	214	f	2026-04-16 02:58:30.736	1	2026-04-18 10:18:01.106	t
7	WOMENDAY	Quốc tế phụ nữ 8/3	FIXED_AMOUNT	30000	2024-03-01 00:00:00	2024-03-10 00:00:00	830	830	f	2026-04-16 02:58:30.736	1	2026-04-18 10:18:01.129	t
8	BIRTHDAY_APR	Mừng sinh nhật shop tháng 4	PERCENTAGE	25	2024-04-01 00:00:00	2024-04-10 00:00:00	400	400	f	2026-04-16 02:58:30.736	1	2026-04-18 10:18:01.138	t
9	FLASHSALE1	Flash Sale chớp nhoáng	FIXED_AMOUNT	99000	2024-04-12 00:00:00	2024-04-13 00:00:00	50	50	f	2026-04-16 02:58:30.736	1	2026-04-18 10:18:01.145	t
\.


--
-- TOC entry 3907 (class 0 OID 18105)
-- Dependencies: 268
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ccba95eb-dccc-43f6-891d-5b91fa6b3141	bef73217cf4f9b48ed61cbdc348f256c7ab92789bed0f35315d116aa0ce6349c	2026-04-16 09:43:26.020209+07	20260129034441_add_new_fields_for_order_items	\N	\N	2026-04-16 09:43:26.006037+07	1
b2a3b9fe-d6e3-4938-8e78-7ad3a0eb57d1	797b9057f301e3381b61e9f32464a4554828b4888bcf8ca4dc4093799e79c7a7	2026-04-16 09:43:25.267448+07	20250927122948_first_create_user_model_and_role_enum	\N	\N	2026-04-16 09:43:25.242042+07	1
9ec32a84-cb25-437d-8902-eb8a501a68de	27390a73fe3c81127526e792c158e117f97757b0202915e5772e6eac7cef7843	2026-04-16 09:43:25.664317+07	20251120130041_add_new_relation_for_voucher_there_are_voucher_for_product_special_product_variant_and_category	\N	\N	2026-04-16 09:43:25.641456+07	1
23ef13f1-4a20-4161-aad6-b10157959309	7f07e4c2171fb49ba4cae042afb2f537993692d95c0fa525521dc726c5119283	2026-04-16 09:43:25.293468+07	20250927152918_update_user_prisma_schema	\N	\N	2026-04-16 09:43:25.274846+07	1
a1eab23a-b958-4f14-8466-c5f8833f56e2	82c7dee98c9019a3677be3572994d934e6b674ded1640fc4d57e4de0cbef615a	2026-04-16 09:43:25.32198+07	20250928072459_update_password_field_type_for_user_account	\N	\N	2026-04-16 09:43:25.300153+07	1
eb7b5e9a-f63e-41be-bac6-2cee5fca8d12	19607241ead8386da9080337693ed2717d7df08b0da7a25ccf8721202d84dec2	2026-04-16 09:43:25.846594+07	20251204090717_update_relation_request_have_many_media	\N	\N	2026-04-16 09:43:25.827395+07	1
4967ede7-fb43-460e-9cc9-6679a53f8914	63befaade6400e7f26a2703b8d1c7b04ccec4000a1b37f273e6afe1573ed2435	2026-04-16 09:43:25.344325+07	20251002143912_update_unique_constrain_for_email_field_in_user_model	\N	\N	2026-04-16 09:43:25.327407+07	1
5ae1de84-e89d-41a5-91c8-631e38d3da3c	915d2a3db2a36796510c98db3d7602a5edc3e157afa326d3e9dce261fb976169	2026-04-16 09:43:25.690241+07	20251120140013_add_new_shop_office_model_insert_new_field_for_relation_from_shop_office_to_staff_address_product_and_category	\N	\N	2026-04-16 09:43:25.669586+07	1
19af114f-5505-4abe-b7de-3e39a28a8c4e	d765fb4e4f2cf66655ad1165492348d85c9aa04df575830da1ceb06338dbc7fd	2026-04-16 09:43:25.36987+07	20251003114347_update_option_field_in_user_model_in_prisma_schema	\N	\N	2026-04-16 09:43:25.349359+07	1
c2109dad-8370-43e2-8221-d792aa19384f	0cb0c830a9c4ee2757cd0ac1059c1832827ca3f2554016c0b1226cccfb58a7e5	2026-04-16 09:43:25.466922+07	20251115111632_define_all_needed_model_version_1	\N	\N	2026-04-16 09:43:25.375597+07	1
65d1e69b-27df-4051-9cfd-88a163547437	973226f7820fa9abe10a092714421b8d535b458a51a3c7c97b1cb6a1d3b9c117	2026-04-16 09:43:25.505817+07	20251116130216_merge_staff_and_customer_model_into_user_model_and_delete_redundant_staff_and_customer_model	\N	\N	2026-04-16 09:43:25.475361+07	1
1c6f373c-7d70-4098-a2fe-9d1fc8d57b28	034c7eb721ecae92a1ec0323f1f4cb84b893d750d708cf51f65c5c39083549bf	2026-04-16 09:43:25.715218+07	20251120141842_update_add_new_shop_name_field_in_shop_office_model	\N	\N	2026-04-16 09:43:25.696775+07	1
b5058bbf-8d77-4b3d-a0ef-79d41aee5028	23dc9bb564fe31873d4675b5434c4fb79cba28f2a02077ee2a13077bee7349eb	2026-04-16 09:43:25.536526+07	20251117093736_add_new_relation_in_user_model_after_merge_customer_and_staff_model_these_relation_are_on_manage_shop_for_staff_admin	\N	\N	2026-04-16 09:43:25.512398+07	1
76826098-19f2-45e9-9d5f-3302831cbf87	276a5aa1a52dfdd1e96c1130ab3d46650b40ab69df70de5f989da16c7df24c78	2026-04-16 09:43:25.564548+07	20251117120232_change_data_type_of_media_type_field_in_media_model_from_string_to_enum_media_type	\N	\N	2026-04-16 09:43:25.542517+07	1
552cd3a2-b634-4118-a948-878c91cdaa03	48961dc07fadfbc573e172cd9e2c5428233eaaf0c7f8a775a7db399cd58d1e3d	2026-04-16 09:43:25.975741+07	20260128085832_add_new_color_table_and_reference_color_to_product_variants_is_optional_and_update_process_by_staff_fields_in_orders_shipments_requests_to_is_optional	\N	\N	2026-04-16 09:43:25.952791+07	1
a044cf33-6c4b-4416-892e-59e35b1443bb	190044508dee24057f6af9254033c05c9547e27615c675de3c6fae14f0185207	2026-04-16 09:43:25.589227+07	20251118035314_update_size_profiles_prisma_model	\N	\N	2026-04-16 09:43:25.570553+07	1
85113ae6-87ed-4d5d-838b-806a8e01a27b	6b9f0085b4276233d3c74a15291a281cc69594f70a97698d488c13b79e0ab009	2026-04-16 09:43:25.741314+07	20251120153917_delete_dont_need_unique_contraint_in_model	\N	\N	2026-04-16 09:43:25.721991+07	1
8c596b48-66d0-437a-bbd5-159668510f44	1cb1268c945ea47f08bbd86596212dc580b198ee9bfd164c674037478548b253	2026-04-16 09:43:25.633409+07	20251118062409_update_ondelete_and_onupdate_in_relation_in_prisma_model	\N	\N	2026-04-16 09:43:25.595716+07	1
440bca09-9821-4a18-b363-65a98d52e178	77c15dbe8eeb9a8dd47bb555a0d2499db97a09281377a47992ed66449739290a	2026-04-16 09:43:25.870369+07	20251205094939_add_google_id_field_in_user_model	\N	\N	2026-04-16 09:43:25.852393+07	1
93f547a3-940c-47bd-bbd2-96569539f159	e29a67bdc570e1877b5d9c71197ca68458c441c8cad867850b32525c5db53fc0	2026-04-16 09:43:25.76827+07	20251201014014_update_is_shop_logo_and_is_shop_banner_fields_in_media_model	\N	\N	2026-04-16 09:43:25.748484+07	1
627cba4a-c89d-4cff-a4cc-bcf413ef05c8	1fe8d8f93782e67f921141bb438eb32875dcbe8373a59fd8db2b1ac50208ed29	2026-04-16 09:43:25.794547+07	20251201021219_update_add_is_category_file_field_in_media_model	\N	\N	2026-04-16 09:43:25.775883+07	1
450ba184-148a-4d9e-bb65-a0293b84fb83	353195bbd51081032c934cebc83e644a88c02d9840fa1beaf1d2710a7f0bdeea	2026-04-16 09:43:25.820122+07	20251201110210_update_add_is_avatar_file_field_in_media_model	\N	\N	2026-04-16 09:43:25.800616+07	1
042453af-c36e-47e1-a1b1-18f72ea3027e	c8682091abcebf526c48f71a306d680ed1524f156c628c2da5c82a707715259d	2026-04-16 09:43:25.8978+07	20251205104942_delete_field_google_id_on_user_model_prisma	\N	\N	2026-04-16 09:43:25.876289+07	1
681a6814-62cf-4ad6-a7ce-c2bc5745994b	77c15dbe8eeb9a8dd47bb555a0d2499db97a09281377a47992ed66449739290a	2026-04-16 09:43:25.924749+07	20251205111701_add_google_id_field_in_user_model_prisma	\N	\N	2026-04-16 09:43:25.904672+07	1
c2689ac8-7afd-415c-b10f-b5324c087478	0808530f9722831e12959ddfcb34b55f7d663aa3f10e34da92ab4147e93d54e5	2026-04-16 09:43:25.999014+07	20260129033230_add_new_fields_for_product_variants_and_add_default_db_type_for_fields	\N	\N	2026-04-16 09:43:25.980821+07	1
ba915ff5-9a27-415b-b1a0-43914981d7e4	520a8cf6d8d14ea1d8d4b6340761ba37b5b7e8ebb65e3620784bd8cc462afa35	2026-04-16 09:43:25.946346+07	20260112025438_delete_is_admin_column_in_user_table_because_role_admin_operator_user_is_enough	\N	\N	2026-04-16 09:43:25.929733+07	1
ec468886-31a2-4cf3-9489-f60c1942b988	3ba33a90694e99c45a6be07d6ff4c69c585681183e81f67a343d456801e53bda	2026-04-16 09:43:26.092961+07	20260129104751_add_new_bank_account_number_and_bank_name_fields_for_return_requests_table	\N	\N	2026-04-16 09:43:26.074206+07	1
fcab60e6-ed2c-4298-a31a-9707f41863f1	1e9d56bb09f8292fe9d36494c73d7b6b9fd60508fd77c9dfcf9612aaa0bb4672	2026-04-16 09:43:26.044869+07	20260129042415_update	\N	\N	2026-04-16 09:43:26.025413+07	1
1fefa378-31a2-45a3-922c-3d8487f372d3	0e8e08e90304e8534ca9f8cbb5f1d9f42d993f7eb1392bcec3e47d2fdb463bfe	2026-04-16 09:43:26.069025+07	20260129094129_add_new_currency_unit_fields	\N	\N	2026-04-16 09:43:26.049365+07	1
db2fd776-7a96-4312-8b09-e5d49cbba950	39c18a1c8cd365c8f823eb983ced1805eef481f70cf699f3dc17c71ae4b86092	2026-04-16 09:43:26.111439+07	20260129112418_update_bank_account_number_and_bank_name_fields_for_return_requests_table	\N	\N	2026-04-16 09:43:26.097322+07	1
1f06568e-6d18-4cef-9b66-fd81086d4bac	4954a93a6865b128734f0c0c229df8f11ea80aba75ab10bcaf4868c17dc43b33	2026-04-16 09:43:26.14863+07	20260202075018_update_index_for_table_in_db	\N	\N	2026-04-16 09:43:26.115452+07	1
da6e7303-e290-41a1-a4f9-b05880888020	f26ce3be06bc09d9259a205c00ec47e4eea896a7f247fa0c6d9ccb3eab27688d	2026-04-16 09:43:26.165693+07	20260202075207_update_update_at_fields_delete_default_now	\N	\N	2026-04-16 09:43:26.153014+07	1
f9b01886-b218-4f95-9a9d-26962b6b2313	0b8146efe9bb0d4a17884edcd0b2149307f0f5660a31c7ce77b7105dd711bc6a	2026-04-16 09:43:26.191801+07	20260210042607_update_model_for_connect_ghn_shipment	\N	\N	2026-04-16 09:43:26.170848+07	1
254b56bb-9ee0-4ed6-b9e3-1eb747ce3f47	51c230c2f76ea3251a4e10c31f3db4c5b17a12eda92e9c3a11487bfd2c269f57	2026-04-16 09:43:26.631591+07	20260329102905_add_package_checksums_id_in_orders_model	\N	\N	2026-04-16 09:43:26.614207+07	1
e3b8e9cc-125e-42fb-a055-f003a3d2cf7e	b2bd1e943c2b91cc873256baf431d071d5ede98268b9e8c7f3d4c674f4a5f802	2026-04-16 09:43:26.214604+07	20260214103915_add_description_field_for_orders_shipments_tables	\N	\N	2026-04-16 09:43:26.196944+07	1
8b3a271e-d97b-47f6-a87c-f22f30af5df8	0114b7ac9d99b3de63dbc4590794aecd254f8c1616abbf10efb419832776c903	2026-04-16 09:43:26.488751+07	20260326022110_add_ghn_shipment_jobs_model	\N	\N	2026-04-16 09:43:26.469221+07	1
5855483c-00d3-4893-b998-3c3c72c2d67c	2f68d0140652ea42e90dbbc44fc3b58c5edcb1dbec0e167e12d4d0f5bf569082	2026-04-16 09:43:26.237991+07	20260216072203_add_ghn_shop_province_id_ghn_shop_district_id_ghn_shop_ward_code_fields	\N	\N	2026-04-16 09:43:26.221345+07	1
09f771b7-4b45-4b1c-aa4c-3815ca0cf362	df2ede48ac686685cb1ab1659176467ee60a76b6fd94b1018d80022d0eacce3b	2026-04-16 09:43:26.257037+07	20260306082320_add_media_relation_for_product_table	\N	\N	2026-04-16 09:43:26.242652+07	1
dc9e1ce1-1094-4f17-9af0-d516ae320e6f	7648be3fc8e3c1ca42231ec1de77536f5f9afc5ca6dd33e1cb64c29a1bcfb6dd	2026-04-16 09:43:26.277742+07	20260311023541_update_the_order_status_shipment_status_payment_status_enums_version_1_0	\N	\N	2026-04-16 09:43:26.262969+07	1
b4d2006b-8c96-401e-8896-0d9c30607989	d9a8550b14af5ab976fe187b26ed33b783d5f354cecb90eec99e6e00778785fe	2026-04-16 09:43:26.510049+07	20260326024644_delete_ghn_shipment_jobs_model	\N	\N	2026-04-16 09:43:26.493674+07	1
f4280cf8-cbec-428f-a882-1e9686b70ac6	154b6bff846fe5b2c57f6f6355090e0e579ec1b01980be5b5db598bac10f4267	2026-04-16 09:43:26.297453+07	20260311023608_update_the_order_status_shipment_status_payment_status_enums_version_1_1	\N	\N	2026-04-16 09:43:26.282165+07	1
c7e2fae3-c752-4276-879d-fe6a3cf0df5f	f9054e5b1f1c3d1794af9b074c268a6c72b5ca8fbb251e0389fd3702c5a3c156	2026-04-16 09:43:26.331546+07	20260311024120_update_the_order_status_shipment_status_payment_status_enums_version_1_2	\N	\N	2026-04-16 09:43:26.302034+07	1
0fead126-90ca-4779-8d83-1a172b10f67b	6ec3cfa468ee7b00aaa0fa6e21e77d70c2f3ceb00dcf5b6f7ce15f1c597caeb2	2026-04-16 09:43:26.358138+07	20260311082900_delete_shop_office_entity_and_shop_id_field_in_prisma_schema	\N	\N	2026-04-16 09:43:26.337339+07	1
f05881bc-9f4e-4544-8b8f-f4cfee936527	72f9ff909527c6637e259ec1d6a08ee9166199c51a3ec016c6c42e76cdbd80e8	2026-04-16 09:43:26.528885+07	20260326025345_delete_ghn_shipment_job_status_enum	\N	\N	2026-04-16 09:43:26.514459+07	1
2335342f-9278-41c7-9947-2edeea1d7b85	bdcc675b5ca78ff81655985ac0adcd6e30cb438a54384a3495c72575dd9df37e	2026-04-16 09:43:26.38282+07	20260313154850_add_package_checksums_model	\N	\N	2026-04-16 09:43:26.36252+07	1
df1459ad-6f9b-479e-ac73-46b80148708b	5f5ee1c5a6320a08843e6af9fa3d16b591cf2aef0c7e29a8be2a850a495b4f14	2026-04-16 09:43:26.407879+07	20260314033636_add_expired_at_and_is_used_fields_in_package_checksum_model	\N	\N	2026-04-16 09:43:26.389735+07	1
9c8ab11f-d093-4b21-bd55-30e653099e6e	45fefc33459c6d2b493777c2814575595fb8955b605a138d75f7471c04b0c527	2026-04-16 09:43:26.653691+07	20260329151530_add_cancelled_status_for_shipment_status_payment_status_enums	\N	\N	2026-04-16 09:43:26.636862+07	1
997446e7-7e35-4758-a72c-5f0d080c2f87	837879790fe4f910669842fcf8a6db6d14c6e74612c22d5fd10c382d4ea3ff1e	2026-04-16 09:43:26.435641+07	20260314043442_add_user_id_field_in_package_checksum_model	\N	\N	2026-04-16 09:43:26.414818+07	1
4f2d4542-d144-48a9-b3ac-88c857b3029e	e90f731f7596ae87ef08fc04f0cba41ac397d3d06f01cd3e1b6e47e328cde4cd	2026-04-16 09:43:26.548422+07	20260326113204_add_test_model_for_test_run_again_loss_migrate	\N	\N	2026-04-16 09:43:26.533078+07	1
d193d551-7de1-46fa-95ae-3e08d0cc3c19	bbfd6246c38279222003a26e8985d2ae2c7081e15c703bce6048dd0815bd8235	2026-04-16 09:43:26.462766+07	20260314091915_add_is_over_usage_limit_field_in_vouchers_model	\N	\N	2026-04-16 09:43:26.443574+07	1
72d45306-5954-49f8-b137-d12f5aba0d40	4391d84660445052b510c9f90130ac3e14c973a6d2f7382158e233f3a647893c	2026-04-16 09:43:26.56897+07	20260326113505_delete_test_model_for_test_run_again_loss_migrate	\N	\N	2026-04-16 09:43:26.55253+07	1
aed7b099-ae45-4ca3-826d-2ed510bb63e8	fe68c3deada655440fba97cfa81bf20e35246e9dd439a71a5c661838af46c94c	2026-04-16 09:43:26.748382+07	20260330100342_delete_payment_methods_are_not_cod_and_vnpay_in_payment_method_enum	\N	\N	2026-04-16 09:43:26.724297+07	1
52f6cf49-be5b-45a3-bdbe-d963c02bcc6b	fc6e07dbc4be1b69a8e2f908334ade873242d6a427f320cf7c194d1ba0e8e03c	2026-04-16 09:43:26.588766+07	20260329070700_add_is_order_address_field_in_address_model	\N	\N	2026-04-16 09:43:26.574728+07	1
506caa53-de0e-45ae-901e-3d2939254609	88be99c18ca0bc36e6e3297ffd6622a96a92fa4f6d903e4e9603defa20bb6317	2026-04-16 09:43:26.677229+07	20260330094657_delete_return_requests_model_and_update_request_type_in_requests_model	\N	\N	2026-04-16 09:43:26.659643+07	1
ad841630-3759-4b2c-b873-17b9045f9176	9871e2686538d850e3e2c5431c052f8101358887727fb42146e7614924282f0e	2026-04-16 09:43:26.607651+07	20260329075345_add_applied_voucher_for_order_items_and_add_applied_user_voucher_for_orders	\N	\N	2026-04-16 09:43:26.593046+07	1
6b06682e-6516-4766-8232-bf1b7d7ff577	515ef4f070e321a88652dcc1a7b49ff234d4c5b17b23e691485b4e2ec964ec58	2026-04-16 09:43:26.856608+07	20260401074018_change_price_format_from_float_db_double_pricision_to_decimal_db_decimal_15_2_and_add_new_vnp_expire_date_to_payments_model	\N	\N	2026-04-16 09:43:26.802155+07	1
ca16b6f4-9091-4a7b-82e7-b31aaab55fcf	5303324e73b017df15b1828e1a23e2be62526accd8561b23811f37a0f3a95a5e	2026-04-16 09:43:26.698577+07	20260330095141_rollback_after_delete_return_requests_model_and_update_request_type_in_requests_model	\N	\N	2026-04-16 09:43:26.681359+07	1
a7abbec0-bbcf-471b-b558-92df0868286e	c08a6c3e7a73ed73848bebcb248b92fd0cf1454c9bb51932c35745e359fcf499	2026-04-16 09:43:26.778551+07	20260330101525_add_request_type_enum	\N	\N	2026-04-16 09:43:26.756796+07	1
c4e68b33-857e-4467-8f50-9e68e39d1e1b	6fc531915a06b15148f46a16f66dd2bc0523e5674ca4bf093146f53a312b1e17	2026-04-16 09:43:26.718985+07	20260330095623_delete_bank_name_and_bank_account_number_in_return_requests_model	\N	\N	2026-04-16 09:43:26.70343+07	1
b730a54a-e5a2-4029-8a8b-490a3487167e	a492f46fbd52f1da6a7f9baf3f6870a8f98f641e8b02894bee639e5d5ceeb0e8	2026-04-16 09:43:26.797079+07	20260331153112_add_vnp_create_date_in_payments_model	\N	\N	2026-04-16 09:43:26.782852+07	1
e0da7157-7195-4291-ba12-ef88f9e1438f	7576d7b89cef25aa067a24a0c14ba790c78c093e31cb5fa36af6388f4fb5ff5b	2026-04-16 09:43:26.929816+07	20260402040412_add_ghn_pick_shift_model_and_add_new_ghn_pick_shift_id_in_shipments_model	\N	\N	2026-04-16 09:43:26.912778+07	1
99639c57-dd5e-44e5-be4a-eb3a90feacd0	dadac58fb0e0f841a6f469234fcc1c12f36c1941fbc6bd36edf05aea1d32ef6b	2026-04-16 09:43:26.907372+07	20260401075136_rollback_change_price_format	\N	\N	2026-04-16 09:43:26.863092+07	1
0f902b2d-52da-456c-8f03-e774a1eedee7	a88ae962de25849ea2a14184b3b764ab14f47c5483d0baa79e84d761374edaa9	2026-04-16 09:43:26.953024+07	20260402142904_add_bank_name_enum	\N	\N	2026-04-16 09:43:26.934291+07	1
f77202b8-7649-4534-b07e-34e51ec396f2	f173fedddb4c748687e8a8a8e2f18c11c76e761f26e296ff4c56c8e0008a85fc	2026-04-16 09:43:26.976719+07	20260402143341_update_bank_fields_in_return_requests_model	\N	\N	2026-04-16 09:43:26.960472+07	1
ca786542-09a4-41cc-9b0f-ecb3c557d10b	91f44bba813804c263566709c8c73e687e7907e68f72a4e9a01a0a9c5731e558	2026-04-16 09:43:26.995562+07	20260403160320_update_order_status_enum	\N	\N	2026-04-16 09:43:26.980994+07	1
443c0149-0253-4a65-8978-93d9580faa30	10cb81a955dd64f1f1d45531fee11b1a07fad59cf8f9c813fc0c752d0c8a31dc	2026-04-16 09:43:27.01493+07	20260405104546_update_is_new_product_variant_and_sold_quantity_fields_in_product_variants_model	\N	\N	2026-04-16 09:43:26.999935+07	1
13fbdca7-3854-454c-90c9-8e84cdbd2d1e	139394d33853fb2cf0116c2f67a41ad5a04d90b434a76c633a51b6d773c9f1e1	2026-04-16 09:43:27.096787+07	20260408132826_add_new_message_room_chat_user_room_chat_models_for_chat_module	\N	\N	2026-04-16 09:43:27.019544+07	1
65712ad0-f8be-4548-8467-f6b75f0c6e52	2d97ef4554f8b6b940ced994ad67498922b7d8bebfc7992710eb2ad7648ac945	2026-04-16 09:43:27.137259+07	20260412122532_add_notification_model	\N	\N	2026-04-16 09:43:27.110291+07	1
5b663aa1-1b42-4235-b530-6c12eac5a36e	5a6c97bcccaf88f5ce29fd6710fc145e408fd309ebee5806b18485942356e324	2026-04-16 09:43:27.163119+07	20260413025205_fix_separate_notification_models	\N	\N	2026-04-16 09:43:27.142883+07	1
62f5d873-da9e-47b4-a1df-0c8eda0c25a9	7ac437bfc4c53026cbd81f287e0aea0d73f5c254c55134ce74c1dfe451f83942	2026-04-16 09:43:27.186244+07	20260413080410_fix_union_all_notification_models_into_one_model	\N	\N	2026-04-16 09:43:27.167319+07	1
777cf029-5213-4d2a-8d94-5f511f29aa2f	03837219b8e0bb809ad49a996aa48aeccdda4b1eacfc7340df180f63ebf46bad	2026-04-16 09:43:27.204364+07	20260413082417_fix_notification_model	\N	\N	2026-04-16 09:43:27.191048+07	1
6059b02a-3119-4893-b88d-e1ca4be3442b	af521553fd0ba6fa77cd61ffe4a374f20a40de0ce5280c365d820696df88ecea	2026-04-18 20:29:59.395506+07	20260418132959_add_customer_phone_field_in_orders_model	\N	\N	2026-04-18 20:29:59.372282+07	1
f49c4227-110e-43e5-be87-e66bc2cae510	d8d64476b5f80958fa216b77df520076497b3ed648b69874c17a080428fa32d4	2026-04-23 15:24:00.160049+07	20260423082400_add_analytics_view_mode_enum	\N	\N	2026-04-23 15:24:00.116595+07	1
\.


--
-- TOC entry 3940 (class 0 OID 0)
-- Dependencies: 218
-- Name: Address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Address_id_seq"', 5056, true);


--
-- TOC entry 3941 (class 0 OID 0)
-- Dependencies: 221
-- Name: CartItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CartItems_id_seq"', 28, true);


--
-- TOC entry 3942 (class 0 OID 0)
-- Dependencies: 222
-- Name: Cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Cart_id_seq"', 9, true);


--
-- TOC entry 3943 (class 0 OID 0)
-- Dependencies: 224
-- Name: Category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Category_id_seq"', 12, true);


--
-- TOC entry 3944 (class 0 OID 0)
-- Dependencies: 226
-- Name: Color_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Color_id_seq"', 10, true);


--
-- TOC entry 3945 (class 0 OID 0)
-- Dependencies: 228
-- Name: GhnPickShift_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."GhnPickShift_id_seq"', 10, true);


--
-- TOC entry 3946 (class 0 OID 0)
-- Dependencies: 230
-- Name: Media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Media_id_seq"', 657, true);


--
-- TOC entry 3947 (class 0 OID 0)
-- Dependencies: 232
-- Name: Message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Message_id_seq"', 1, true);


--
-- TOC entry 3948 (class 0 OID 0)
-- Dependencies: 234
-- Name: Notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Notification_id_seq"', 106, true);


--
-- TOC entry 3949 (class 0 OID 0)
-- Dependencies: 236
-- Name: OrderItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OrderItems_id_seq"', 46, true);


--
-- TOC entry 3950 (class 0 OID 0)
-- Dependencies: 238
-- Name: Orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Orders_id_seq"', 46, true);


--
-- TOC entry 3951 (class 0 OID 0)
-- Dependencies: 240
-- Name: PackageChecksums_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PackageChecksums_id_seq"', 46, true);


--
-- TOC entry 3952 (class 0 OID 0)
-- Dependencies: 242
-- Name: Payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Payments_id_seq"', 46, true);


--
-- TOC entry 3953 (class 0 OID 0)
-- Dependencies: 244
-- Name: ProductVariants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ProductVariants_id_seq"', 1420, true);


--
-- TOC entry 3954 (class 0 OID 0)
-- Dependencies: 246
-- Name: Products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Products_id_seq"', 181, true);


--
-- TOC entry 3955 (class 0 OID 0)
-- Dependencies: 248
-- Name: Requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Requests_id_seq"', 2, true);


--
-- TOC entry 3956 (class 0 OID 0)
-- Dependencies: 250
-- Name: ReturnRequests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ReturnRequests_id_seq"', 2, true);


--
-- TOC entry 3957 (class 0 OID 0)
-- Dependencies: 252
-- Name: Reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Reviews_id_seq"', 1, false);


--
-- TOC entry 3958 (class 0 OID 0)
-- Dependencies: 254
-- Name: RoomChat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."RoomChat_id_seq"', 1, true);


--
-- TOC entry 3959 (class 0 OID 0)
-- Dependencies: 256
-- Name: ShipmentItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ShipmentItems_id_seq"', 46, true);


--
-- TOC entry 3960 (class 0 OID 0)
-- Dependencies: 258
-- Name: Shipments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Shipments_id_seq"', 46, true);


--
-- TOC entry 3961 (class 0 OID 0)
-- Dependencies: 260
-- Name: SizeProfiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."SizeProfiles_id_seq"', 1, false);


--
-- TOC entry 3962 (class 0 OID 0)
-- Dependencies: 264
-- Name: UserVouchers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UserVouchers_id_seq"', 19, true);


--
-- TOC entry 3963 (class 0 OID 0)
-- Dependencies: 265
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 13, true);


--
-- TOC entry 3964 (class 0 OID 0)
-- Dependencies: 267
-- Name: Vouchers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Vouchers_id_seq"', 20, true);


--
-- TOC entry 3547 (class 2606 OID 18138)
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- TOC entry 3554 (class 2606 OID 18140)
-- Name: CartItems CartItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_pkey" PRIMARY KEY (id);


--
-- TOC entry 3550 (class 2606 OID 18142)
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);


--
-- TOC entry 3559 (class 2606 OID 18144)
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- TOC entry 3565 (class 2606 OID 18146)
-- Name: Color Color_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Color"
    ADD CONSTRAINT "Color_pkey" PRIMARY KEY (id);


--
-- TOC entry 3567 (class 2606 OID 18148)
-- Name: GhnPickShift GhnPickShift_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GhnPickShift"
    ADD CONSTRAINT "GhnPickShift_pkey" PRIMARY KEY (id);


--
-- TOC entry 3569 (class 2606 OID 18150)
-- Name: Media Media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_pkey" PRIMARY KEY (id);


--
-- TOC entry 3576 (class 2606 OID 18152)
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- TOC entry 3580 (class 2606 OID 18154)
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- TOC entry 3584 (class 2606 OID 18156)
-- Name: OrderItems OrderItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_pkey" PRIMARY KEY (id);


--
-- TOC entry 3588 (class 2606 OID 18158)
-- Name: Orders Orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_pkey" PRIMARY KEY (id);


--
-- TOC entry 3593 (class 2606 OID 18160)
-- Name: PackageChecksums PackageChecksums_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PackageChecksums"
    ADD CONSTRAINT "PackageChecksums_pkey" PRIMARY KEY (id);


--
-- TOC entry 3597 (class 2606 OID 18162)
-- Name: Payments Payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_pkey" PRIMARY KEY (id);


--
-- TOC entry 3601 (class 2606 OID 18164)
-- Name: ProductVariants ProductVariants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariants"
    ADD CONSTRAINT "ProductVariants_pkey" PRIMARY KEY (id);


--
-- TOC entry 3608 (class 2606 OID 18166)
-- Name: Products Products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_pkey" PRIMARY KEY (id);


--
-- TOC entry 3614 (class 2606 OID 18168)
-- Name: Requests Requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Requests"
    ADD CONSTRAINT "Requests_pkey" PRIMARY KEY (id);


--
-- TOC entry 3619 (class 2606 OID 18170)
-- Name: ReturnRequests ReturnRequests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReturnRequests"
    ADD CONSTRAINT "ReturnRequests_pkey" PRIMARY KEY (id);


--
-- TOC entry 3623 (class 2606 OID 18172)
-- Name: Reviews Reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_pkey" PRIMARY KEY (id);


--
-- TOC entry 3628 (class 2606 OID 18174)
-- Name: RoomChat RoomChat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RoomChat"
    ADD CONSTRAINT "RoomChat_pkey" PRIMARY KEY (id);


--
-- TOC entry 3630 (class 2606 OID 18176)
-- Name: ShipmentItems ShipmentItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShipmentItems"
    ADD CONSTRAINT "ShipmentItems_pkey" PRIMARY KEY (id);


--
-- TOC entry 3635 (class 2606 OID 18178)
-- Name: Shipments Shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shipments"
    ADD CONSTRAINT "Shipments_pkey" PRIMARY KEY (id);


--
-- TOC entry 3639 (class 2606 OID 18180)
-- Name: SizeProfiles SizeProfiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SizeProfiles"
    ADD CONSTRAINT "SizeProfiles_pkey" PRIMARY KEY (id);


--
-- TOC entry 3648 (class 2606 OID 18182)
-- Name: UserRoomChat UserRoomChat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRoomChat"
    ADD CONSTRAINT "UserRoomChat_pkey" PRIMARY KEY ("userId", "roomChatId");


--
-- TOC entry 3652 (class 2606 OID 18184)
-- Name: UserVouchers UserVouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserVouchers"
    ADD CONSTRAINT "UserVouchers_pkey" PRIMARY KEY (id);


--
-- TOC entry 3644 (class 2606 OID 18186)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 3657 (class 2606 OID 18188)
-- Name: Vouchers Vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vouchers"
    ADD CONSTRAINT "Vouchers_pkey" PRIMARY KEY (id);


--
-- TOC entry 3660 (class 2606 OID 18190)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3551 (class 1259 OID 18191)
-- Name: Cart_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Cart_userId_key" ON public."Cart" USING btree ("userId");


--
-- TOC entry 3557 (class 1259 OID 18192)
-- Name: Category_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);


--
-- TOC entry 3563 (class 1259 OID 18193)
-- Name: Color_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Color_name_key" ON public."Color" USING btree (name);


--
-- TOC entry 3570 (class 1259 OID 18194)
-- Name: Media_url_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Media_url_key" ON public."Media" USING btree (url);


--
-- TOC entry 3598 (class 1259 OID 18195)
-- Name: Payments_transactionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Payments_transactionId_key" ON public."Payments" USING btree ("transactionId");


--
-- TOC entry 3602 (class 1259 OID 18196)
-- Name: ProductVariants_stockKeepingUnit_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductVariants_stockKeepingUnit_key" ON public."ProductVariants" USING btree ("stockKeepingUnit");


--
-- TOC entry 3609 (class 1259 OID 18197)
-- Name: Products_stockKeepingUnit_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Products_stockKeepingUnit_key" ON public."Products" USING btree ("stockKeepingUnit");


--
-- TOC entry 3620 (class 1259 OID 18198)
-- Name: ReturnRequests_requestId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ReturnRequests_requestId_key" ON public."ReturnRequests" USING btree ("requestId");


--
-- TOC entry 3633 (class 1259 OID 18199)
-- Name: Shipments_ghnOrderCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Shipments_ghnOrderCode_key" ON public."Shipments" USING btree ("ghnOrderCode");


--
-- TOC entry 3641 (class 1259 OID 18200)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 3642 (class 1259 OID 18201)
-- Name: User_googleId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_googleId_key" ON public."User" USING btree ("googleId");


--
-- TOC entry 3645 (class 1259 OID 18202)
-- Name: User_staffCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_staffCode_key" ON public."User" USING btree ("staffCode");


--
-- TOC entry 3646 (class 1259 OID 18203)
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- TOC entry 3655 (class 1259 OID 18204)
-- Name: Vouchers_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Vouchers_code_key" ON public."Vouchers" USING btree (code);


--
-- TOC entry 3548 (class 1259 OID 18205)
-- Name: idx_address_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_address_user_id ON public."Address" USING btree ("userId");


--
-- TOC entry 3555 (class 1259 OID 18206)
-- Name: idx_cartItem_cart_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_cartItem_cart_id" ON public."CartItems" USING btree ("cartId");


--
-- TOC entry 3556 (class 1259 OID 18207)
-- Name: idx_cartItem_product_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_cartItem_product_variant_id" ON public."CartItems" USING btree ("productVariantId");


--
-- TOC entry 3552 (class 1259 OID 18208)
-- Name: idx_cart_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_user_id ON public."Cart" USING btree ("userId");


--
-- TOC entry 3560 (class 1259 OID 18209)
-- Name: idx_category_created_by_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_category_created_by_user_id ON public."Category" USING btree ("createByUserId");


--
-- TOC entry 3561 (class 1259 OID 18210)
-- Name: idx_category_parent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_category_parent_id ON public."Category" USING btree ("parentId");


--
-- TOC entry 3562 (class 1259 OID 18211)
-- Name: idx_category_voucher_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_category_voucher_id ON public."Category" USING btree ("voucherId");


--
-- TOC entry 3571 (class 1259 OID 18212)
-- Name: idx_media_product_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_product_variant_id ON public."Media" USING btree ("productVariantId");


--
-- TOC entry 3572 (class 1259 OID 18213)
-- Name: idx_media_request_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_request_id ON public."Media" USING btree ("requestId");


--
-- TOC entry 3573 (class 1259 OID 18214)
-- Name: idx_media_review_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_review_id ON public."Media" USING btree ("reviewId");


--
-- TOC entry 3574 (class 1259 OID 18215)
-- Name: idx_media_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_user_id ON public."Media" USING btree ("userId");


--
-- TOC entry 3577 (class 1259 OID 18216)
-- Name: idx_message_room_chat_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_room_chat_id ON public."Message" USING btree ("roomChatId");


--
-- TOC entry 3578 (class 1259 OID 18217)
-- Name: idx_message_sender_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_sender_id ON public."Message" USING btree ("senderId");


--
-- TOC entry 3581 (class 1259 OID 18218)
-- Name: idx_notification_creator_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_creator_id ON public."Notification" USING btree ("creatorId");


--
-- TOC entry 3582 (class 1259 OID 18219)
-- Name: idx_notification_recipient_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_recipient_id ON public."Notification" USING btree ("recipientId");


--
-- TOC entry 3585 (class 1259 OID 18220)
-- Name: idx_orderItem_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_orderItem_order_id" ON public."OrderItems" USING btree ("orderId");


--
-- TOC entry 3586 (class 1259 OID 18221)
-- Name: idx_orderItem_product_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_orderItem_product_variant_id" ON public."OrderItems" USING btree ("productVariantId");


--
-- TOC entry 3589 (class 1259 OID 18222)
-- Name: idx_order_processed_by_staff_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_processed_by_staff_id ON public."Orders" USING btree ("processByStaffId");


--
-- TOC entry 3590 (class 1259 OID 18223)
-- Name: idx_order_shipping_address_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_shipping_address_id ON public."Orders" USING btree ("shippingAddressId");


--
-- TOC entry 3591 (class 1259 OID 18224)
-- Name: idx_order_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_user_id ON public."Orders" USING btree ("userId");


--
-- TOC entry 3594 (class 1259 OID 18225)
-- Name: idx_packageChecksum_ghn_shop_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_packageChecksum_ghn_shop_id" ON public."PackageChecksums" USING btree ("ghnShopId");


--
-- TOC entry 3595 (class 1259 OID 18226)
-- Name: idx_packageChecksum_shop_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_packageChecksum_shop_id" ON public."PackageChecksums" USING btree ("shopId");


--
-- TOC entry 3599 (class 1259 OID 18227)
-- Name: idx_payment_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_order_id ON public."Payments" USING btree ("orderId");


--
-- TOC entry 3603 (class 1259 OID 18228)
-- Name: idx_productVariant_color_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_productVariant_color_id" ON public."ProductVariants" USING btree ("colorId");


--
-- TOC entry 3604 (class 1259 OID 18229)
-- Name: idx_productVariant_created_by_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_productVariant_created_by_user_id" ON public."ProductVariants" USING btree ("createByUserId");


--
-- TOC entry 3605 (class 1259 OID 18230)
-- Name: idx_productVariant_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_productVariant_product_id" ON public."ProductVariants" USING btree ("productId");


--
-- TOC entry 3606 (class 1259 OID 18231)
-- Name: idx_productVariant_voucher_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_productVariant_voucher_id" ON public."ProductVariants" USING btree ("voucherId");


--
-- TOC entry 3610 (class 1259 OID 18232)
-- Name: idx_product_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_category_id ON public."Products" USING btree ("categoryId");


--
-- TOC entry 3611 (class 1259 OID 18233)
-- Name: idx_product_created_by_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_created_by_user_id ON public."Products" USING btree ("createByUserId");


--
-- TOC entry 3612 (class 1259 OID 18234)
-- Name: idx_product_voucher_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_voucher_id ON public."Products" USING btree ("voucherId");


--
-- TOC entry 3615 (class 1259 OID 18235)
-- Name: idx_request_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_request_order_id ON public."Requests" USING btree ("orderId");


--
-- TOC entry 3616 (class 1259 OID 18236)
-- Name: idx_request_processed_by_staff_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_request_processed_by_staff_id ON public."Requests" USING btree ("processByStaffId");


--
-- TOC entry 3617 (class 1259 OID 18237)
-- Name: idx_request_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_request_user_id ON public."Requests" USING btree ("userId");


--
-- TOC entry 3621 (class 1259 OID 18238)
-- Name: idx_returnRequest_request_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_returnRequest_request_id" ON public."ReturnRequests" USING btree ("requestId");


--
-- TOC entry 3624 (class 1259 OID 18239)
-- Name: idx_review_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_review_product_id ON public."Reviews" USING btree ("productId");


--
-- TOC entry 3625 (class 1259 OID 18240)
-- Name: idx_review_product_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_review_product_variant_id ON public."Reviews" USING btree ("productVariantId");


--
-- TOC entry 3626 (class 1259 OID 18241)
-- Name: idx_review_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_review_user_id ON public."Reviews" USING btree ("userId");


--
-- TOC entry 3631 (class 1259 OID 18242)
-- Name: idx_shipmentItem_order_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_shipmentItem_order_item_id" ON public."ShipmentItems" USING btree ("orderItemId");


--
-- TOC entry 3632 (class 1259 OID 18243)
-- Name: idx_shipmentItem_shipment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_shipmentItem_shipment_id" ON public."ShipmentItems" USING btree ("shipmentId");


--
-- TOC entry 3636 (class 1259 OID 18244)
-- Name: idx_shipment_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipment_order_id ON public."Shipments" USING btree ("orderId");


--
-- TOC entry 3637 (class 1259 OID 18245)
-- Name: idx_shipment_processed_by_staff_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipment_processed_by_staff_id ON public."Shipments" USING btree ("processByStaffId");


--
-- TOC entry 3640 (class 1259 OID 18246)
-- Name: idx_sizeProfile_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_sizeProfile_user_id" ON public."SizeProfiles" USING btree ("userId");


--
-- TOC entry 3649 (class 1259 OID 18247)
-- Name: idx_userRoomChat_room_chat_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_userRoomChat_room_chat_id" ON public."UserRoomChat" USING btree ("roomChatId");


--
-- TOC entry 3650 (class 1259 OID 18248)
-- Name: idx_userRoomChat_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_userRoomChat_user_id" ON public."UserRoomChat" USING btree ("userId");


--
-- TOC entry 3653 (class 1259 OID 18249)
-- Name: idx_userVoucher_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_userVoucher_user_id" ON public."UserVouchers" USING btree ("userId");


--
-- TOC entry 3654 (class 1259 OID 18250)
-- Name: idx_userVoucher_voucher_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_userVoucher_voucher_id" ON public."UserVouchers" USING btree ("voucherId");


--
-- TOC entry 3658 (class 1259 OID 18251)
-- Name: idx_voucher_created_by_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_voucher_created_by_user_id ON public."Vouchers" USING btree ("createdBy");


--
-- TOC entry 3661 (class 2606 OID 18252)
-- Name: Address Address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3663 (class 2606 OID 18257)
-- Name: CartItems CartItems_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3664 (class 2606 OID 18262)
-- Name: CartItems CartItems_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public."ProductVariants"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3662 (class 2606 OID 18267)
-- Name: Cart Cart_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3665 (class 2606 OID 18272)
-- Name: Category Category_createByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_createByUserId_fkey" FOREIGN KEY ("createByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3666 (class 2606 OID 18277)
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3667 (class 2606 OID 18282)
-- Name: Category Category_voucherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES public."Vouchers"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3668 (class 2606 OID 18287)
-- Name: Media Media_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3669 (class 2606 OID 18292)
-- Name: Media Media_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public."ProductVariants"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3670 (class 2606 OID 18297)
-- Name: Media Media_requestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES public."Requests"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3671 (class 2606 OID 18302)
-- Name: Media Media_reviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES public."Reviews"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3672 (class 2606 OID 18307)
-- Name: Media Media_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3673 (class 2606 OID 18312)
-- Name: Message Message_roomChatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_roomChatId_fkey" FOREIGN KEY ("roomChatId") REFERENCES public."RoomChat"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3674 (class 2606 OID 18317)
-- Name: Message Message_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3675 (class 2606 OID 18322)
-- Name: Notification Notification_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3676 (class 2606 OID 18327)
-- Name: Notification Notification_recipientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3677 (class 2606 OID 18332)
-- Name: OrderItems OrderItems_appliedVoucherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_appliedVoucherId_fkey" FOREIGN KEY ("appliedVoucherId") REFERENCES public."Vouchers"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3678 (class 2606 OID 18337)
-- Name: OrderItems OrderItems_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3679 (class 2606 OID 18342)
-- Name: OrderItems OrderItems_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public."ProductVariants"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3680 (class 2606 OID 18347)
-- Name: Orders Orders_packageChecksumsId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_packageChecksumsId_fkey" FOREIGN KEY ("packageChecksumsId") REFERENCES public."PackageChecksums"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3681 (class 2606 OID 18352)
-- Name: Orders Orders_processByStaffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_processByStaffId_fkey" FOREIGN KEY ("processByStaffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3682 (class 2606 OID 18357)
-- Name: Orders Orders_shippingAddressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES public."Address"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3683 (class 2606 OID 18362)
-- Name: Orders Orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3684 (class 2606 OID 18367)
-- Name: Payments Payments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3685 (class 2606 OID 18372)
-- Name: ProductVariants ProductVariants_colorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariants"
    ADD CONSTRAINT "ProductVariants_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES public."Color"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3686 (class 2606 OID 18377)
-- Name: ProductVariants ProductVariants_createByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariants"
    ADD CONSTRAINT "ProductVariants_createByUserId_fkey" FOREIGN KEY ("createByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3687 (class 2606 OID 18382)
-- Name: ProductVariants ProductVariants_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariants"
    ADD CONSTRAINT "ProductVariants_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3688 (class 2606 OID 18387)
-- Name: ProductVariants ProductVariants_voucherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariants"
    ADD CONSTRAINT "ProductVariants_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES public."Vouchers"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3689 (class 2606 OID 18392)
-- Name: Products Products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3690 (class 2606 OID 18397)
-- Name: Products Products_createByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_createByUserId_fkey" FOREIGN KEY ("createByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3691 (class 2606 OID 18402)
-- Name: Products Products_voucherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES public."Vouchers"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3692 (class 2606 OID 18407)
-- Name: Requests Requests_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Requests"
    ADD CONSTRAINT "Requests_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3693 (class 2606 OID 18412)
-- Name: Requests Requests_processByStaffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Requests"
    ADD CONSTRAINT "Requests_processByStaffId_fkey" FOREIGN KEY ("processByStaffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3694 (class 2606 OID 18417)
-- Name: Requests Requests_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Requests"
    ADD CONSTRAINT "Requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3695 (class 2606 OID 18422)
-- Name: ReturnRequests ReturnRequests_requestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReturnRequests"
    ADD CONSTRAINT "ReturnRequests_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES public."Requests"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3696 (class 2606 OID 18427)
-- Name: Reviews Reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3697 (class 2606 OID 18432)
-- Name: Reviews Reviews_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public."ProductVariants"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3698 (class 2606 OID 18437)
-- Name: Reviews Reviews_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3699 (class 2606 OID 18442)
-- Name: ShipmentItems ShipmentItems_orderItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShipmentItems"
    ADD CONSTRAINT "ShipmentItems_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES public."OrderItems"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3700 (class 2606 OID 18447)
-- Name: ShipmentItems ShipmentItems_shipmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShipmentItems"
    ADD CONSTRAINT "ShipmentItems_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES public."Shipments"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3701 (class 2606 OID 18452)
-- Name: Shipments Shipments_ghnPickShiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shipments"
    ADD CONSTRAINT "Shipments_ghnPickShiftId_fkey" FOREIGN KEY ("ghnPickShiftId") REFERENCES public."GhnPickShift"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3702 (class 2606 OID 18457)
-- Name: Shipments Shipments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shipments"
    ADD CONSTRAINT "Shipments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3703 (class 2606 OID 18462)
-- Name: Shipments Shipments_processByStaffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shipments"
    ADD CONSTRAINT "Shipments_processByStaffId_fkey" FOREIGN KEY ("processByStaffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3704 (class 2606 OID 18467)
-- Name: SizeProfiles SizeProfiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SizeProfiles"
    ADD CONSTRAINT "SizeProfiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3705 (class 2606 OID 18472)
-- Name: UserRoomChat UserRoomChat_roomChatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRoomChat"
    ADD CONSTRAINT "UserRoomChat_roomChatId_fkey" FOREIGN KEY ("roomChatId") REFERENCES public."RoomChat"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3706 (class 2606 OID 18477)
-- Name: UserRoomChat UserRoomChat_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRoomChat"
    ADD CONSTRAINT "UserRoomChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3707 (class 2606 OID 18482)
-- Name: UserVouchers UserVouchers_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserVouchers"
    ADD CONSTRAINT "UserVouchers_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3708 (class 2606 OID 18487)
-- Name: UserVouchers UserVouchers_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserVouchers"
    ADD CONSTRAINT "UserVouchers_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3709 (class 2606 OID 18492)
-- Name: UserVouchers UserVouchers_voucherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserVouchers"
    ADD CONSTRAINT "UserVouchers_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES public."Vouchers"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3710 (class 2606 OID 18497)
-- Name: Vouchers Vouchers_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vouchers"
    ADD CONSTRAINT "Vouchers_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3914 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-04-27 16:45:12

--
-- PostgreSQL database dump complete
--

