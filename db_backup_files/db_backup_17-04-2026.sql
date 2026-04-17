--
-- PostgreSQL database dump
--

-- Dumped from database version 17.9 (Debian 17.9-1.pgdg13+1)
-- Dumped by pg_dump version 17.2

-- Started on 2026-04-17 08:19:47

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
-- TOC entry 5 (class 2615 OID 72557)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 3910 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 915 (class 1247 OID 72644)
-- Name: DiscountType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DiscountType" AS ENUM (
    'PERCENTAGE',
    'FIXED_AMOUNT'
);


ALTER TYPE public."DiscountType" OWNER TO postgres;

--
-- TOC entry 906 (class 1247 OID 72588)
-- Name: Gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER'
);


ALTER TYPE public."Gender" OWNER TO postgres;

--
-- TOC entry 969 (class 1247 OID 73077)
-- Name: MediaType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MediaType" AS ENUM (
    'IMAGE',
    'VIDEO',
    'DOCUMENT'
);


ALTER TYPE public."MediaType" OWNER TO postgres;

--
-- TOC entry 1011 (class 1247 OID 73836)
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'SHOP_NOTIFICATION',
    'PERSONAL_NOTIFICATION'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- TOC entry 978 (class 1247 OID 73373)
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
-- TOC entry 990 (class 1247 OID 73510)
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'COD',
    'VNPAY'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- TOC entry 909 (class 1247 OID 72624)
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
-- TOC entry 918 (class 1247 OID 72650)
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
-- TOC entry 993 (class 1247 OID 73523)
-- Name: RequestType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RequestType" AS ENUM (
    'RETURN_REQUEST',
    'CANCEL_REQUEST',
    'CUSTOMER_SUPPORT'
);


ALTER TYPE public."RequestType" OWNER TO postgres;

--
-- TOC entry 900 (class 1247 OID 72568)
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN',
    'OPERATOR'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- TOC entry 981 (class 1247 OID 73400)
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
-- TOC entry 999 (class 1247 OID 73678)
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
-- TOC entry 912 (class 1247 OID 72634)
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
-- TOC entry 221 (class 1259 OID 72682)
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
-- TOC entry 220 (class 1259 OID 72681)
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
-- TOC entry 3912 (class 0 OID 0)
-- Dependencies: 220
-- Name: Address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Address_id_seq" OWNED BY public."Address".id;


--
-- TOC entry 243 (class 1259 OID 72791)
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
-- TOC entry 245 (class 1259 OID 72799)
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
-- TOC entry 244 (class 1259 OID 72798)
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
-- TOC entry 3913 (class 0 OID 0)
-- Dependencies: 244
-- Name: CartItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CartItems_id_seq" OWNED BY public."CartItems".id;


--
-- TOC entry 242 (class 1259 OID 72790)
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
-- TOC entry 3914 (class 0 OID 0)
-- Dependencies: 242
-- Name: Cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Cart_id_seq" OWNED BY public."Cart".id;


--
-- TOC entry 227 (class 1259 OID 72713)
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
-- TOC entry 226 (class 1259 OID 72712)
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
-- TOC entry 3915 (class 0 OID 0)
-- Dependencies: 226
-- Name: Category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;


--
-- TOC entry 253 (class 1259 OID 73229)
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
-- TOC entry 252 (class 1259 OID 73228)
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
-- TOC entry 3916 (class 0 OID 0)
-- Dependencies: 252
-- Name: Color_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Color_id_seq" OWNED BY public."Color".id;


--
-- TOC entry 261 (class 1259 OID 73665)
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
-- TOC entry 260 (class 1259 OID 73664)
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
-- TOC entry 3917 (class 0 OID 0)
-- Dependencies: 260
-- Name: GhnPickShift_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."GhnPickShift_id_seq" OWNED BY public."GhnPickShift".id;


--
-- TOC entry 233 (class 1259 OID 72743)
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
-- TOC entry 232 (class 1259 OID 72742)
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
-- TOC entry 3918 (class 0 OID 0)
-- Dependencies: 232
-- Name: Media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Media_id_seq" OWNED BY public."Media".id;


--
-- TOC entry 266 (class 1259 OID 73752)
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
-- TOC entry 265 (class 1259 OID 73751)
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
-- TOC entry 3919 (class 0 OID 0)
-- Dependencies: 265
-- Name: Message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Message_id_seq" OWNED BY public."Message".id;


--
-- TOC entry 268 (class 1259 OID 73842)
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
-- TOC entry 267 (class 1259 OID 73841)
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
-- TOC entry 3920 (class 0 OID 0)
-- Dependencies: 267
-- Name: Notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Notification_id_seq" OWNED BY public."Notification".id;


--
-- TOC entry 237 (class 1259 OID 72765)
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
-- TOC entry 236 (class 1259 OID 72764)
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
-- TOC entry 3921 (class 0 OID 0)
-- Dependencies: 236
-- Name: OrderItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."OrderItems_id_seq" OWNED BY public."OrderItems".id;


--
-- TOC entry 235 (class 1259 OID 72754)
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
    "packageChecksumsId" bigint NOT NULL
);


ALTER TABLE public."Orders" OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 72753)
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
-- TOC entry 3922 (class 0 OID 0)
-- Dependencies: 234
-- Name: Orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Orders_id_seq" OWNED BY public."Orders".id;


--
-- TOC entry 257 (class 1259 OID 73424)
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
-- TOC entry 256 (class 1259 OID 73423)
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
-- TOC entry 3923 (class 0 OID 0)
-- Dependencies: 256
-- Name: PackageChecksums_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PackageChecksums_id_seq" OWNED BY public."PackageChecksums".id;


--
-- TOC entry 241 (class 1259 OID 72782)
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
-- TOC entry 240 (class 1259 OID 72781)
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
-- TOC entry 3924 (class 0 OID 0)
-- Dependencies: 240
-- Name: Payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Payments_id_seq" OWNED BY public."Payments".id;


--
-- TOC entry 229 (class 1259 OID 72723)
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
-- TOC entry 228 (class 1259 OID 72722)
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
-- TOC entry 3925 (class 0 OID 0)
-- Dependencies: 228
-- Name: ProductVariants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ProductVariants_id_seq" OWNED BY public."ProductVariants".id;


--
-- TOC entry 225 (class 1259 OID 72702)
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
-- TOC entry 224 (class 1259 OID 72701)
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
-- TOC entry 3926 (class 0 OID 0)
-- Dependencies: 224
-- Name: Products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Products_id_seq" OWNED BY public."Products".id;


--
-- TOC entry 251 (class 1259 OID 72829)
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
-- TOC entry 250 (class 1259 OID 72828)
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
-- TOC entry 3927 (class 0 OID 0)
-- Dependencies: 250
-- Name: Requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Requests_id_seq" OWNED BY public."Requests".id;


--
-- TOC entry 259 (class 1259 OID 73495)
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
-- TOC entry 258 (class 1259 OID 73494)
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
-- TOC entry 3928 (class 0 OID 0)
-- Dependencies: 258
-- Name: ReturnRequests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ReturnRequests_id_seq" OWNED BY public."ReturnRequests".id;


--
-- TOC entry 231 (class 1259 OID 72733)
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
-- TOC entry 230 (class 1259 OID 72732)
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
-- TOC entry 3929 (class 0 OID 0)
-- Dependencies: 230
-- Name: Reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Reviews_id_seq" OWNED BY public."Reviews".id;


--
-- TOC entry 263 (class 1259 OID 73734)
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
-- TOC entry 262 (class 1259 OID 73733)
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
-- TOC entry 3930 (class 0 OID 0)
-- Dependencies: 262
-- Name: RoomChat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."RoomChat_id_seq" OWNED BY public."RoomChat".id;


--
-- TOC entry 255 (class 1259 OID 73325)
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
-- TOC entry 254 (class 1259 OID 73324)
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
-- TOC entry 3931 (class 0 OID 0)
-- Dependencies: 254
-- Name: ShipmentItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ShipmentItems_id_seq" OWNED BY public."ShipmentItems".id;


--
-- TOC entry 239 (class 1259 OID 72773)
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
-- TOC entry 238 (class 1259 OID 72772)
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
-- TOC entry 3932 (class 0 OID 0)
-- Dependencies: 238
-- Name: Shipments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Shipments_id_seq" OWNED BY public."Shipments".id;


--
-- TOC entry 223 (class 1259 OID 72692)
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
-- TOC entry 222 (class 1259 OID 72691)
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
-- TOC entry 3933 (class 0 OID 0)
-- Dependencies: 222
-- Name: SizeProfiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."SizeProfiles_id_seq" OWNED BY public."SizeProfiles".id;


--
-- TOC entry 219 (class 1259 OID 72574)
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
-- TOC entry 264 (class 1259 OID 73744)
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
-- TOC entry 249 (class 1259 OID 72820)
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
-- TOC entry 248 (class 1259 OID 72819)
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
-- TOC entry 3934 (class 0 OID 0)
-- Dependencies: 248
-- Name: UserVouchers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."UserVouchers_id_seq" OWNED BY public."UserVouchers".id;


--
-- TOC entry 218 (class 1259 OID 72573)
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
-- TOC entry 3935 (class 0 OID 0)
-- Dependencies: 218
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- TOC entry 247 (class 1259 OID 72807)
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
-- TOC entry 246 (class 1259 OID 72806)
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
-- TOC entry 3936 (class 0 OID 0)
-- Dependencies: 246
-- Name: Vouchers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Vouchers_id_seq" OWNED BY public."Vouchers".id;


--
-- TOC entry 217 (class 1259 OID 72558)
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
-- TOC entry 3449 (class 2604 OID 72685)
-- Name: Address id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address" ALTER COLUMN id SET DEFAULT nextval('public."Address_id_seq"'::regclass);


--
-- TOC entry 3502 (class 2604 OID 72794)
-- Name: Cart id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart" ALTER COLUMN id SET DEFAULT nextval('public."Cart_id_seq"'::regclass);


--
-- TOC entry 3504 (class 2604 OID 72802)
-- Name: CartItems id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItems" ALTER COLUMN id SET DEFAULT nextval('public."CartItems_id_seq"'::regclass);


--
-- TOC entry 3464 (class 2604 OID 72716)
-- Name: Category id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);


--
-- TOC entry 3521 (class 2604 OID 73232)
-- Name: Color id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Color" ALTER COLUMN id SET DEFAULT nextval('public."Color_id_seq"'::regclass);


--
-- TOC entry 3530 (class 2604 OID 73668)
-- Name: GhnPickShift id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GhnPickShift" ALTER COLUMN id SET DEFAULT nextval('public."GhnPickShift_id_seq"'::regclass);


--
-- TOC entry 3477 (class 2604 OID 72746)
-- Name: Media id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media" ALTER COLUMN id SET DEFAULT nextval('public."Media_id_seq"'::regclass);


--
-- TOC entry 3537 (class 2604 OID 73755)
-- Name: Message id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message" ALTER COLUMN id SET DEFAULT nextval('public."Message_id_seq"'::regclass);


--
-- TOC entry 3539 (class 2604 OID 73845)
-- Name: Notification id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification" ALTER COLUMN id SET DEFAULT nextval('public."Notification_id_seq"'::regclass);


--
-- TOC entry 3489 (class 2604 OID 72768)
-- Name: OrderItems id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItems" ALTER COLUMN id SET DEFAULT nextval('public."OrderItems_id_seq"'::regclass);


--
-- TOC entry 3484 (class 2604 OID 72757)
-- Name: Orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders" ALTER COLUMN id SET DEFAULT nextval('public."Orders_id_seq"'::regclass);


--
-- TOC entry 3525 (class 2604 OID 73427)
-- Name: PackageChecksums id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PackageChecksums" ALTER COLUMN id SET DEFAULT nextval('public."PackageChecksums_id_seq"'::regclass);


--
-- TOC entry 3496 (class 2604 OID 72785)
-- Name: Payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments" ALTER COLUMN id SET DEFAULT nextval('public."Payments_id_seq"'::regclass);


--
-- TOC entry 3466 (class 2604 OID 72726)
-- Name: ProductVariants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariants" ALTER COLUMN id SET DEFAULT nextval('public."ProductVariants_id_seq"'::regclass);


--
-- TOC entry 3461 (class 2604 OID 72705)
-- Name: Products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products" ALTER COLUMN id SET DEFAULT nextval('public."Products_id_seq"'::regclass);


--
-- TOC entry 3517 (class 2604 OID 72832)
-- Name: Requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Requests" ALTER COLUMN id SET DEFAULT nextval('public."Requests_id_seq"'::regclass);


--
-- TOC entry 3528 (class 2604 OID 73498)
-- Name: ReturnRequests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReturnRequests" ALTER COLUMN id SET DEFAULT nextval('public."ReturnRequests_id_seq"'::regclass);


--
-- TOC entry 3475 (class 2604 OID 72736)
-- Name: Reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews" ALTER COLUMN id SET DEFAULT nextval('public."Reviews_id_seq"'::regclass);


--
-- TOC entry 3532 (class 2604 OID 73737)
-- Name: RoomChat id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RoomChat" ALTER COLUMN id SET DEFAULT nextval('public."RoomChat_id_seq"'::regclass);


--
-- TOC entry 3523 (class 2604 OID 73328)
-- Name: ShipmentItems id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShipmentItems" ALTER COLUMN id SET DEFAULT nextval('public."ShipmentItems_id_seq"'::regclass);


--
-- TOC entry 3493 (class 2604 OID 72776)
-- Name: Shipments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shipments" ALTER COLUMN id SET DEFAULT nextval('public."Shipments_id_seq"'::regclass);


--
-- TOC entry 3452 (class 2604 OID 72695)
-- Name: SizeProfiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SizeProfiles" ALTER COLUMN id SET DEFAULT nextval('public."SizeProfiles_id_seq"'::regclass);


--
-- TOC entry 3443 (class 2604 OID 72577)
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- TOC entry 3513 (class 2604 OID 72823)
-- Name: UserVouchers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserVouchers" ALTER COLUMN id SET DEFAULT nextval('public."UserVouchers_id_seq"'::regclass);


--
-- TOC entry 3506 (class 2604 OID 72810)
-- Name: Vouchers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vouchers" ALTER COLUMN id SET DEFAULT nextval('public."Vouchers_id_seq"'::regclass);


--
-- TOC entry 3857 (class 0 OID 72682)
-- Dependencies: 221
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
\.


--
-- TOC entry 3879 (class 0 OID 72791)
-- Dependencies: 243
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
\.


--
-- TOC entry 3881 (class 0 OID 72799)
-- Dependencies: 245
-- Data for Name: CartItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CartItems" (id, "cartId", "productVariantId", quantity, "createdAt", "updatedAt") FROM stdin;
1	1	686	2	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
2	1	706	1	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
3	2	598	1	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
4	2	814	1	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
5	2	731	1	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
7	3	728	1	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
8	4	497	2	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
9	4	802	2	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
10	4	577	1	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
11	4	547	1	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
12	5	403	2	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
13	5	693	1	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
14	5	601	1	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
15	6	790	1	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
16	6	729	2	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
17	6	629	2	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
18	7	620	1	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
19	7	790	1	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
20	7	514	1	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
21	7	821	2	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
22	8	413	2	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
23	8	813	2	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
24	8	410	1	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
25	8	692	1	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047
\.


--
-- TOC entry 3863 (class 0 OID 72713)
-- Dependencies: 227
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
-- TOC entry 3889 (class 0 OID 73229)
-- Dependencies: 253
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
-- TOC entry 3897 (class 0 OID 73665)
-- Dependencies: 261
-- Data for Name: GhnPickShift; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."GhnPickShift" (id, "ghnShiftId", "ghnTitle", "ghnFromTime", "ghnToTime", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3869 (class 0 OID 72743)
-- Dependencies: 233
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
\.


--
-- TOC entry 3902 (class 0 OID 73752)
-- Dependencies: 266
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Message" (id, content, "senderId", "roomChatId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3904 (class 0 OID 73842)
-- Dependencies: 268
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, title, content, type, "creatorId", "recipientId", "isRead", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3873 (class 0 OID 72765)
-- Dependencies: 237
-- Data for Name: OrderItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItems" (id, "orderId", "productVariantId", quantity, "unitPrice", "totalPrice", "createdAt", "updatedAt", "discountValue", "currencyUnit", "appliedVoucherId") FROM stdin;
\.


--
-- TOC entry 3871 (class 0 OID 72754)
-- Dependencies: 235
-- Data for Name: Orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Orders" (id, "shippingAddressId", "orderDate", status, "subTotal", "shippingFee", discount, "totalAmount", "createdAt", "updatedAt", "userId", "processByStaffId", "currencyUnit", description, "packageChecksumsId") FROM stdin;
\.


--
-- TOC entry 3893 (class 0 OID 73424)
-- Dependencies: 257
-- Data for Name: PackageChecksums; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PackageChecksums" (id, "ghnShopId", "shopId", "checksumData", "createdAt", "updatedAt", "expiredAt", "isUsed", "userId") FROM stdin;
\.


--
-- TOC entry 3877 (class 0 OID 72782)
-- Dependencies: 241
-- Data for Name: Payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payments" (id, "orderId", "transactionId", "paymentDate", amount, status, "paymentMethod", "currencyUnit", "createdAt", "updatedAt", "vnp_ExpireDate", "vnp_CreateDate") FROM stdin;
\.


--
-- TOC entry 3865 (class 0 OID 72723)
-- Dependencies: 229
-- Data for Name: ProductVariants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductVariants" (id, "productId", "variantName", "variantColor", "variantSize", price, stock, "stockKeepingUnit", "createdAt", "updatedAt", "createByUserId", "voucherId", "colorId", "variantHeight", "variantLength", "variantWeight", "variantWidth", "currencyUnit", "isNewProductVariant", "soldQuantity") FROM stdin;
431	88	Clownz Áo Polo Thể Thao - Nâu Đất - Size S	Nâu Đất	S	259000	100	SKU-3-7-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
432	88	Clownz Áo Polo Thể Thao - Vàng Mù Tạt - Size M	Vàng Mù Tạt	M	259000	100	SKU-3-7-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
433	88	Clownz Áo Polo Thể Thao - Đen Tuyền - Size L	Đen Tuyền	L	259000	100	SKU-3-7-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
434	88	Clownz Áo Polo Thể Thao - Trắng Basic - Size XL	Trắng Basic	XL	259000	100	SKU-3-7-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
402	82	Coolmate Áo Thun Cotton Compact	Xanh Navy	M	199000	100	SKU-3-1-VAR2	2026-04-16 03:21:41.99	2026-04-16 11:51:10.316	1	\N	4	5	25	350	18	VND	t	0
403	82	Coolmate Áo Thun Cotton Compact	Xám Khói	L	199000	100	SKU-3-1-VAR3	2026-04-16 03:21:41.99	2026-04-16 11:51:12.002	1	\N	5	5	25	350	18	VND	t	0
404	82	Coolmate Áo Thun Cotton Compact	Be (Cream)	XL	199000	100	SKU-3-1-VAR4	2026-04-16 03:21:41.99	2026-04-16 11:51:14.084	1	\N	6	5	25	350	18	VND	t	0
405	82	Coolmate Áo Thun Cotton Compact	Xanh Rêu	XXL	199000	100	SKU-3-1-VAR5	2026-04-16 03:21:41.99	2026-04-16 11:51:14.793	1	\N	7	5	25	350	18	VND	t	0
406	83	Routine Áo Polo Excool	Xanh Navy	S	209000	100	SKU-3-2-VAR1	2026-04-16 03:21:41.99	2026-04-16 12:29:20.543	1	\N	4	5	25	350	18	VND	t	0
407	83	Routine Áo Polo Excool	Xám Khói	M	209000	100	SKU-3-2-VAR2	2026-04-16 03:21:41.99	2026-04-16 12:29:20.544	1	\N	5	5	25	350	18	VND	t	0
410	83	Routine Áo Polo Excool	Hồng Pastel	XXL	209000	100	SKU-3-2-VAR5	2026-04-16 03:21:41.99	2026-04-16 12:29:20.55	1	\N	8	5	25	350	18	VND	t	0
411	84	Levents Áo Thun Oversize Graphic	Xám Khói	S	219000	100	SKU-3-3-VAR1	2026-04-16 03:21:41.99	2026-04-17 00:43:22.198	1	\N	5	5	25	350	18	VND	t	0
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
425	86	SSStutter Áo Thun Basic Tee	Đen Tuyền	XXL	239000	100	SKU-3-5-VAR5	2026-04-16 03:21:41.99	2026-04-17 00:56:08.345	1	\N	1	5	25	350	18	VND	t	0
426	87	Outerity Áo Thun Local Brand	Hồng Pastel	S	249000	100	SKU-3-6-VAR1	2026-04-16 03:21:41.99	2026-04-17 00:58:03.029	1	\N	8	5	25	350	18	VND	t	0
427	87	Outerity Áo Thun Local Brand	Nâu Đất	M	249000	100	SKU-3-6-VAR2	2026-04-16 03:21:41.99	2026-04-17 00:58:11.273	1	\N	9	5	25	350	18	VND	t	0
428	87	Outerity Áo Thun Local Brand	Vàng Mù Tạt	L	249000	100	SKU-3-6-VAR3	2026-04-16 03:21:41.99	2026-04-17 00:58:11.527	1	\N	10	5	25	350	18	VND	t	0
429	87	Outerity Áo Thun Local Brand	Đen Tuyền	XL	249000	100	SKU-3-6-VAR4	2026-04-16 03:21:41.99	2026-04-17 00:58:11.594	1	\N	1	5	25	350	18	VND	t	0
430	87	Outerity Áo Thun Local Brand	Trắng Basic	XXL	249000	100	SKU-3-6-VAR5	2026-04-16 03:21:41.99	2026-04-17 00:58:12.079	1	\N	2	5	25	350	18	VND	t	0
435	88	Clownz Áo Polo Thể Thao - Đỏ Đô - Size XXL	Đỏ Đô	XXL	259000	100	SKU-3-7-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
436	89	Hades Áo Thun In Hình - Vàng Mù Tạt - Size S	Vàng Mù Tạt	S	269000	100	SKU-3-8-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
437	89	Hades Áo Thun In Hình - Đen Tuyền - Size M	Đen Tuyền	M	269000	100	SKU-3-8-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
438	89	Hades Áo Thun In Hình - Trắng Basic - Size L	Trắng Basic	L	269000	100	SKU-3-8-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
439	89	Hades Áo Thun In Hình - Đỏ Đô - Size XL	Đỏ Đô	XL	269000	100	SKU-3-8-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
440	89	Hades Áo Thun In Hình - Xanh Navy - Size XXL	Xanh Navy	XXL	269000	100	SKU-3-8-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
441	90	Bobui Áo Polo Phối Bo - Đen Tuyền - Size S	Đen Tuyền	S	279000	100	SKU-3-9-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
442	90	Bobui Áo Polo Phối Bo - Trắng Basic - Size M	Trắng Basic	M	279000	100	SKU-3-9-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
443	90	Bobui Áo Polo Phối Bo - Đỏ Đô - Size L	Đỏ Đô	L	279000	100	SKU-3-9-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
444	90	Bobui Áo Polo Phối Bo - Xanh Navy - Size XL	Xanh Navy	XL	279000	100	SKU-3-9-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
445	90	Bobui Áo Polo Phối Bo - Xám Khói - Size XXL	Xám Khói	XXL	279000	100	SKU-3-9-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
446	91	Degrey Áo Thun Tay Lỡ - Trắng Basic - Size S	Trắng Basic	S	289000	100	SKU-3-10-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
447	91	Degrey Áo Thun Tay Lỡ - Đỏ Đô - Size M	Đỏ Đô	M	289000	100	SKU-3-10-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
448	91	Degrey Áo Thun Tay Lỡ - Xanh Navy - Size L	Xanh Navy	L	289000	100	SKU-3-10-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
449	91	Degrey Áo Thun Tay Lỡ - Xám Khói - Size XL	Xám Khói	XL	289000	100	SKU-3-10-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
450	91	Degrey Áo Thun Tay Lỡ - Be (Cream) - Size XXL	Be (Cream)	XXL	289000	100	SKU-3-10-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
451	92	Owen Sơ Mi Trắng Công Sở - Đỏ Đô - Size S	Đỏ Đô	S	365000	100	SKU-4-1-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
452	92	Owen Sơ Mi Trắng Công Sở - Xanh Navy - Size M	Xanh Navy	M	365000	100	SKU-4-1-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
453	92	Owen Sơ Mi Trắng Công Sở - Xám Khói - Size L	Xám Khói	L	365000	100	SKU-4-1-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
454	92	Owen Sơ Mi Trắng Công Sở - Be (Cream) - Size XL	Be (Cream)	XL	365000	100	SKU-4-1-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
455	92	Owen Sơ Mi Trắng Công Sở - Xanh Rêu - Size XXL	Xanh Rêu	XXL	365000	100	SKU-4-1-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
456	93	Aristino Sơ Mi Flannel Kẻ Caro - Xanh Navy - Size S	Xanh Navy	S	380000	100	SKU-4-2-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
457	93	Aristino Sơ Mi Flannel Kẻ Caro - Xám Khói - Size M	Xám Khói	M	380000	100	SKU-4-2-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
458	93	Aristino Sơ Mi Flannel Kẻ Caro - Be (Cream) - Size L	Be (Cream)	L	380000	100	SKU-4-2-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
459	93	Aristino Sơ Mi Flannel Kẻ Caro - Xanh Rêu - Size XL	Xanh Rêu	XL	380000	100	SKU-4-2-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
460	93	Aristino Sơ Mi Flannel Kẻ Caro - Hồng Pastel - Size XXL	Hồng Pastel	XXL	380000	100	SKU-4-2-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
461	94	Routine Sơ Mi Bamboo Kháng Khuẩn - Xám Khói - Size S	Xám Khói	S	395000	100	SKU-4-3-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
462	94	Routine Sơ Mi Bamboo Kháng Khuẩn - Be (Cream) - Size M	Be (Cream)	M	395000	100	SKU-4-3-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
463	94	Routine Sơ Mi Bamboo Kháng Khuẩn - Xanh Rêu - Size L	Xanh Rêu	L	395000	100	SKU-4-3-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
464	94	Routine Sơ Mi Bamboo Kháng Khuẩn - Hồng Pastel - Size XL	Hồng Pastel	XL	395000	100	SKU-4-3-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
465	94	Routine Sơ Mi Bamboo Kháng Khuẩn - Nâu Đất - Size XXL	Nâu Đất	XXL	395000	100	SKU-4-3-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
466	95	Viet Tien Sơ Mi Oxford Basic - Be (Cream) - Size S	Be (Cream)	S	410000	100	SKU-4-4-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
467	95	Viet Tien Sơ Mi Oxford Basic - Xanh Rêu - Size M	Xanh Rêu	M	410000	100	SKU-4-4-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
468	95	Viet Tien Sơ Mi Oxford Basic - Hồng Pastel - Size L	Hồng Pastel	L	410000	100	SKU-4-4-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
469	95	Viet Tien Sơ Mi Oxford Basic - Nâu Đất - Size XL	Nâu Đất	XL	410000	100	SKU-4-4-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
470	95	Viet Tien Sơ Mi Oxford Basic - Vàng Mù Tạt - Size XXL	Vàng Mù Tạt	XXL	410000	100	SKU-4-4-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
471	96	SSStutter Sơ Mi Cổ Tàu - Xanh Rêu - Size S	Xanh Rêu	S	425000	100	SKU-4-5-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
472	96	SSStutter Sơ Mi Cổ Tàu - Hồng Pastel - Size M	Hồng Pastel	M	425000	100	SKU-4-5-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
473	96	SSStutter Sơ Mi Cổ Tàu - Nâu Đất - Size L	Nâu Đất	L	425000	100	SKU-4-5-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
474	96	SSStutter Sơ Mi Cổ Tàu - Vàng Mù Tạt - Size XL	Vàng Mù Tạt	XL	425000	100	SKU-4-5-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
475	96	SSStutter Sơ Mi Cổ Tàu - Đen Tuyền - Size XXL	Đen Tuyền	XXL	425000	100	SKU-4-5-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
476	97	An Phước Sơ Mi Họa Tiết Tropical - Hồng Pastel - Size S	Hồng Pastel	S	440000	100	SKU-4-6-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
477	97	An Phước Sơ Mi Họa Tiết Tropical - Nâu Đất - Size M	Nâu Đất	M	440000	100	SKU-4-6-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
478	97	An Phước Sơ Mi Họa Tiết Tropical - Vàng Mù Tạt - Size L	Vàng Mù Tạt	L	440000	100	SKU-4-6-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
479	97	An Phước Sơ Mi Họa Tiết Tropical - Đen Tuyền - Size XL	Đen Tuyền	XL	440000	100	SKU-4-6-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
480	97	An Phước Sơ Mi Họa Tiết Tropical - Trắng Basic - Size XXL	Trắng Basic	XXL	440000	100	SKU-4-6-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
481	98	The Blues Sơ Mi Denim Bền Bỉ - Nâu Đất - Size S	Nâu Đất	S	455000	100	SKU-4-7-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
482	98	The Blues Sơ Mi Denim Bền Bỉ - Vàng Mù Tạt - Size M	Vàng Mù Tạt	M	455000	100	SKU-4-7-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
483	98	The Blues Sơ Mi Denim Bền Bỉ - Đen Tuyền - Size L	Đen Tuyền	L	455000	100	SKU-4-7-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
484	98	The Blues Sơ Mi Denim Bền Bỉ - Trắng Basic - Size XL	Trắng Basic	XL	455000	100	SKU-4-7-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
485	98	The Blues Sơ Mi Denim Bền Bỉ - Đỏ Đô - Size XXL	Đỏ Đô	XXL	455000	100	SKU-4-7-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
486	99	Canifa Sơ Mi Linen Thoáng Mát - Vàng Mù Tạt - Size S	Vàng Mù Tạt	S	470000	100	SKU-4-8-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
487	99	Canifa Sơ Mi Linen Thoáng Mát - Đen Tuyền - Size M	Đen Tuyền	M	470000	100	SKU-4-8-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
488	99	Canifa Sơ Mi Linen Thoáng Mát - Trắng Basic - Size L	Trắng Basic	L	470000	100	SKU-4-8-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
489	99	Canifa Sơ Mi Linen Thoáng Mát - Đỏ Đô - Size XL	Đỏ Đô	XL	470000	100	SKU-4-8-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
490	99	Canifa Sơ Mi Linen Thoáng Mát - Xanh Navy - Size XXL	Xanh Navy	XXL	470000	100	SKU-4-8-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
491	100	Mattana Sơ Mi Slimfit - Đen Tuyền - Size S	Đen Tuyền	S	485000	100	SKU-4-9-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
492	100	Mattana Sơ Mi Slimfit - Trắng Basic - Size M	Trắng Basic	M	485000	100	SKU-4-9-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
493	100	Mattana Sơ Mi Slimfit - Đỏ Đô - Size L	Đỏ Đô	L	485000	100	SKU-4-9-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
494	100	Mattana Sơ Mi Slimfit - Xanh Navy - Size XL	Xanh Navy	XL	485000	100	SKU-4-9-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
495	100	Mattana Sơ Mi Slimfit - Xám Khói - Size XXL	Xám Khói	XXL	485000	100	SKU-4-9-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
496	101	Bambo Sơ Mi Cổ Cuban - Trắng Basic - Size S	Trắng Basic	S	500000	100	SKU-4-10-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
497	101	Bambo Sơ Mi Cổ Cuban - Đỏ Đô - Size M	Đỏ Đô	M	500000	100	SKU-4-10-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
498	101	Bambo Sơ Mi Cổ Cuban - Xanh Navy - Size L	Xanh Navy	L	500000	100	SKU-4-10-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
499	101	Bambo Sơ Mi Cổ Cuban - Xám Khói - Size XL	Xám Khói	XL	500000	100	SKU-4-10-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
500	101	Bambo Sơ Mi Cổ Cuban - Be (Cream) - Size XXL	Be (Cream)	XXL	500000	100	SKU-4-10-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
501	102	Routine Quần Jean Slim Fit - Đỏ Đô - Size 38	Đỏ Đô	38	470000	100	SKU-5-1-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
502	102	Routine Quần Jean Slim Fit - Xanh Navy - Size 39	Xanh Navy	39	470000	100	SKU-5-1-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
503	102	Routine Quần Jean Slim Fit - Xám Khói - Size 40	Xám Khói	40	470000	100	SKU-5-1-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
504	102	Routine Quần Jean Slim Fit - Be (Cream) - Size 41	Be (Cream)	41	470000	100	SKU-5-1-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
505	102	Routine Quần Jean Slim Fit - Xanh Rêu - Size 42	Xanh Rêu	42	470000	100	SKU-5-1-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
506	103	GenViet Quần Jean Ống Rộng - Xanh Navy - Size 38	Xanh Navy	38	490000	100	SKU-5-2-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
507	103	GenViet Quần Jean Ống Rộng - Xám Khói - Size 39	Xám Khói	39	490000	100	SKU-5-2-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
508	103	GenViet Quần Jean Ống Rộng - Be (Cream) - Size 40	Be (Cream)	40	490000	100	SKU-5-2-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
509	103	GenViet Quần Jean Ống Rộng - Xanh Rêu - Size 41	Xanh Rêu	41	490000	100	SKU-5-2-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
510	103	GenViet Quần Jean Ống Rộng - Hồng Pastel - Size 42	Hồng Pastel	42	490000	100	SKU-5-2-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
511	104	Copper Denim Quần Jean Baggy Nam - Xám Khói - Size 38	Xám Khói	38	510000	100	SKU-5-3-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
512	104	Copper Denim Quần Jean Baggy Nam - Be (Cream) - Size 39	Be (Cream)	39	510000	100	SKU-5-3-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
513	104	Copper Denim Quần Jean Baggy Nam - Xanh Rêu - Size 40	Xanh Rêu	40	510000	100	SKU-5-3-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
514	104	Copper Denim Quần Jean Baggy Nam - Hồng Pastel - Size 41	Hồng Pastel	41	510000	100	SKU-5-3-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
515	104	Copper Denim Quần Jean Baggy Nam - Nâu Đất - Size 42	Nâu Đất	42	510000	100	SKU-5-3-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
516	105	Levi's Quần Jean Skinny Co Giãn - Be (Cream) - Size 38	Be (Cream)	38	530000	100	SKU-5-4-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
517	105	Levi's Quần Jean Skinny Co Giãn - Xanh Rêu - Size 39	Xanh Rêu	39	530000	100	SKU-5-4-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
518	105	Levi's Quần Jean Skinny Co Giãn - Hồng Pastel - Size 40	Hồng Pastel	40	530000	100	SKU-5-4-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
519	105	Levi's Quần Jean Skinny Co Giãn - Nâu Đất - Size 41	Nâu Đất	41	530000	100	SKU-5-4-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
520	105	Levi's Quần Jean Skinny Co Giãn - Vàng Mù Tạt - Size 42	Vàng Mù Tạt	42	530000	100	SKU-5-4-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
521	106	DirtyCoins Quần Jean Rách Gối - Xanh Rêu - Size 38	Xanh Rêu	38	550000	100	SKU-5-5-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
522	106	DirtyCoins Quần Jean Rách Gối - Hồng Pastel - Size 39	Hồng Pastel	39	550000	100	SKU-5-5-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
523	106	DirtyCoins Quần Jean Rách Gối - Nâu Đất - Size 40	Nâu Đất	40	550000	100	SKU-5-5-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
524	106	DirtyCoins Quần Jean Rách Gối - Vàng Mù Tạt - Size 41	Vàng Mù Tạt	41	550000	100	SKU-5-5-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
525	106	DirtyCoins Quần Jean Rách Gối - Đen Tuyền - Size 42	Đen Tuyền	42	550000	100	SKU-5-5-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
526	107	Blue Exchange Quần Jean Raw Denim - Hồng Pastel - Size 38	Hồng Pastel	38	570000	100	SKU-5-6-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
527	107	Blue Exchange Quần Jean Raw Denim - Nâu Đất - Size 39	Nâu Đất	39	570000	100	SKU-5-6-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
528	107	Blue Exchange Quần Jean Raw Denim - Vàng Mù Tạt - Size 40	Vàng Mù Tạt	40	570000	100	SKU-5-6-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
529	107	Blue Exchange Quần Jean Raw Denim - Đen Tuyền - Size 41	Đen Tuyền	41	570000	100	SKU-5-6-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
530	107	Blue Exchange Quần Jean Raw Denim - Trắng Basic - Size 42	Trắng Basic	42	570000	100	SKU-5-6-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
531	108	Canifa Quần Jean Denim Wash - Nâu Đất - Size 38	Nâu Đất	38	590000	100	SKU-5-7-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
532	108	Canifa Quần Jean Denim Wash - Vàng Mù Tạt - Size 39	Vàng Mù Tạt	39	590000	100	SKU-5-7-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
533	108	Canifa Quần Jean Denim Wash - Đen Tuyền - Size 40	Đen Tuyền	40	590000	100	SKU-5-7-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
534	108	Canifa Quần Jean Denim Wash - Trắng Basic - Size 41	Trắng Basic	41	590000	100	SKU-5-7-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
535	108	Canifa Quần Jean Denim Wash - Đỏ Đô - Size 42	Đỏ Đô	42	590000	100	SKU-5-7-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
671	136	Zapatos Giày Chelsea Boots - Xanh Rêu - Size S	Xanh Rêu	S	1100000	100	SKU-8-5-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
536	109	Yame Quần Jean Jogger - Vàng Mù Tạt - Size 38	Vàng Mù Tạt	38	610000	100	SKU-5-8-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
537	109	Yame Quần Jean Jogger - Đen Tuyền - Size 39	Đen Tuyền	39	610000	100	SKU-5-8-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
538	109	Yame Quần Jean Jogger - Trắng Basic - Size 40	Trắng Basic	40	610000	100	SKU-5-8-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
539	109	Yame Quần Jean Jogger - Đỏ Đô - Size 41	Đỏ Đô	41	610000	100	SKU-5-8-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
540	109	Yame Quần Jean Jogger - Xanh Navy - Size 42	Xanh Navy	42	610000	100	SKU-5-8-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
541	110	Ninmaxx Quần Jean Đen Basic - Đen Tuyền - Size 38	Đen Tuyền	38	630000	100	SKU-5-9-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
542	110	Ninmaxx Quần Jean Đen Basic - Trắng Basic - Size 39	Trắng Basic	39	630000	100	SKU-5-9-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
543	110	Ninmaxx Quần Jean Đen Basic - Đỏ Đô - Size 40	Đỏ Đô	40	630000	100	SKU-5-9-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
544	110	Ninmaxx Quần Jean Đen Basic - Xanh Navy - Size 41	Xanh Navy	41	630000	100	SKU-5-9-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
545	110	Ninmaxx Quần Jean Đen Basic - Xám Khói - Size 42	Xám Khói	42	630000	100	SKU-5-9-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
546	111	Hades Quần Jean Local Brand - Trắng Basic - Size 38	Trắng Basic	38	650000	100	SKU-5-10-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
547	111	Hades Quần Jean Local Brand - Đỏ Đô - Size 39	Đỏ Đô	39	650000	100	SKU-5-10-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
548	111	Hades Quần Jean Local Brand - Xanh Navy - Size 40	Xanh Navy	40	650000	100	SKU-5-10-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
549	111	Hades Quần Jean Local Brand - Xám Khói - Size 41	Xám Khói	41	650000	100	SKU-5-10-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
550	111	Hades Quần Jean Local Brand - Be (Cream) - Size 42	Be (Cream)	42	650000	100	SKU-5-10-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
551	112	Owen Quần Tây Slim Fit - Đỏ Đô - Size 38	Đỏ Đô	38	392000	100	SKU-6-1-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
552	112	Owen Quần Tây Slim Fit - Xanh Navy - Size 39	Xanh Navy	39	392000	100	SKU-6-1-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
553	112	Owen Quần Tây Slim Fit - Xám Khói - Size 40	Xám Khói	40	392000	100	SKU-6-1-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
554	112	Owen Quần Tây Slim Fit - Be (Cream) - Size 41	Be (Cream)	41	392000	100	SKU-6-1-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
555	112	Owen Quần Tây Slim Fit - Xanh Rêu - Size 42	Xanh Rêu	42	392000	100	SKU-6-1-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
556	113	Aristino Quần Kaki Chino Basic - Xanh Navy - Size 38	Xanh Navy	38	404000	100	SKU-6-2-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
557	113	Aristino Quần Kaki Chino Basic - Xám Khói - Size 39	Xám Khói	39	404000	100	SKU-6-2-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
558	113	Aristino Quần Kaki Chino Basic - Be (Cream) - Size 40	Be (Cream)	40	404000	100	SKU-6-2-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
559	113	Aristino Quần Kaki Chino Basic - Xanh Rêu - Size 41	Xanh Rêu	41	404000	100	SKU-6-2-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
560	113	Aristino Quần Kaki Chino Basic - Hồng Pastel - Size 42	Hồng Pastel	42	404000	100	SKU-6-2-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
561	114	Routine Quần Tây Âu Lịch Sự - Xám Khói - Size 38	Xám Khói	38	416000	100	SKU-6-3-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
562	114	Routine Quần Tây Âu Lịch Sự - Be (Cream) - Size 39	Be (Cream)	39	416000	100	SKU-6-3-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
563	114	Routine Quần Tây Âu Lịch Sự - Xanh Rêu - Size 40	Xanh Rêu	40	416000	100	SKU-6-3-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
564	114	Routine Quần Tây Âu Lịch Sự - Hồng Pastel - Size 41	Hồng Pastel	41	416000	100	SKU-6-3-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
565	114	Routine Quần Tây Âu Lịch Sự - Nâu Đất - Size 42	Nâu Đất	42	416000	100	SKU-6-3-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
566	115	SSStutter Quần Kaki Co Giãn 4 Chiều - Be (Cream) - Size 38	Be (Cream)	38	428000	100	SKU-6-4-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
567	115	SSStutter Quần Kaki Co Giãn 4 Chiều - Xanh Rêu - Size 39	Xanh Rêu	39	428000	100	SKU-6-4-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
568	115	SSStutter Quần Kaki Co Giãn 4 Chiều - Hồng Pastel - Size 40	Hồng Pastel	40	428000	100	SKU-6-4-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
569	115	SSStutter Quần Kaki Co Giãn 4 Chiều - Nâu Đất - Size 41	Nâu Đất	41	428000	100	SKU-6-4-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
570	115	SSStutter Quần Kaki Co Giãn 4 Chiều - Vàng Mù Tạt - Size 42	Vàng Mù Tạt	42	428000	100	SKU-6-4-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
571	116	Coolmate Quần Tây Không Nhăn - Xanh Rêu - Size 38	Xanh Rêu	38	440000	100	SKU-6-5-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
572	116	Coolmate Quần Tây Không Nhăn - Hồng Pastel - Size 39	Hồng Pastel	39	440000	100	SKU-6-5-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
573	116	Coolmate Quần Tây Không Nhăn - Nâu Đất - Size 40	Nâu Đất	40	440000	100	SKU-6-5-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
574	116	Coolmate Quần Tây Không Nhăn - Vàng Mù Tạt - Size 41	Vàng Mù Tạt	41	440000	100	SKU-6-5-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
575	116	Coolmate Quần Tây Không Nhăn - Đen Tuyền - Size 42	Đen Tuyền	42	440000	100	SKU-6-5-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
576	117	Việt Tiến Quần Kaki Túi Hộp - Hồng Pastel - Size 38	Hồng Pastel	38	452000	100	SKU-6-6-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
577	117	Việt Tiến Quần Kaki Túi Hộp - Nâu Đất - Size 39	Nâu Đất	39	452000	100	SKU-6-6-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
578	117	Việt Tiến Quần Kaki Túi Hộp - Vàng Mù Tạt - Size 40	Vàng Mù Tạt	40	452000	100	SKU-6-6-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
579	117	Việt Tiến Quần Kaki Túi Hộp - Đen Tuyền - Size 41	Đen Tuyền	41	452000	100	SKU-6-6-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
580	117	Việt Tiến Quần Kaki Túi Hộp - Trắng Basic - Size 42	Trắng Basic	42	452000	100	SKU-6-6-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
581	118	Mattana Quần Tây Sidetab - Nâu Đất - Size 38	Nâu Đất	38	464000	100	SKU-6-7-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
582	118	Mattana Quần Tây Sidetab - Vàng Mù Tạt - Size 39	Vàng Mù Tạt	39	464000	100	SKU-6-7-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
583	118	Mattana Quần Tây Sidetab - Đen Tuyền - Size 40	Đen Tuyền	40	464000	100	SKU-6-7-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
584	118	Mattana Quần Tây Sidetab - Trắng Basic - Size 41	Trắng Basic	41	464000	100	SKU-6-7-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
585	118	Mattana Quần Tây Sidetab - Đỏ Đô - Size 42	Đỏ Đô	42	464000	100	SKU-6-7-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
586	119	An Phước Quần Kaki Form Regular - Vàng Mù Tạt - Size 38	Vàng Mù Tạt	38	476000	100	SKU-6-8-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
587	119	An Phước Quần Kaki Form Regular - Đen Tuyền - Size 39	Đen Tuyền	39	476000	100	SKU-6-8-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
588	119	An Phước Quần Kaki Form Regular - Trắng Basic - Size 40	Trắng Basic	40	476000	100	SKU-6-8-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
589	119	An Phước Quần Kaki Form Regular - Đỏ Đô - Size 41	Đỏ Đô	41	476000	100	SKU-6-8-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
590	119	An Phước Quần Kaki Form Regular - Xanh Navy - Size 42	Xanh Navy	42	476000	100	SKU-6-8-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
591	120	Canifa Quần Tây Sợi Tre - Đen Tuyền - Size 38	Đen Tuyền	38	488000	100	SKU-6-9-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
592	120	Canifa Quần Tây Sợi Tre - Trắng Basic - Size 39	Trắng Basic	39	488000	100	SKU-6-9-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
593	120	Canifa Quần Tây Sợi Tre - Đỏ Đô - Size 40	Đỏ Đô	40	488000	100	SKU-6-9-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
594	120	Canifa Quần Tây Sợi Tre - Xanh Navy - Size 41	Xanh Navy	41	488000	100	SKU-6-9-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
595	120	Canifa Quần Tây Sợi Tre - Xám Khói - Size 42	Xám Khói	42	488000	100	SKU-6-9-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
596	121	The Blues Quần Kaki Công Sở - Trắng Basic - Size 38	Trắng Basic	38	500000	100	SKU-6-10-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
597	121	The Blues Quần Kaki Công Sở - Đỏ Đô - Size 39	Đỏ Đô	39	500000	100	SKU-6-10-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
598	121	The Blues Quần Kaki Công Sở - Xanh Navy - Size 40	Xanh Navy	40	500000	100	SKU-6-10-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
599	121	The Blues Quần Kaki Công Sở - Xám Khói - Size 41	Xám Khói	41	500000	100	SKU-6-10-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
600	121	The Blues Quần Kaki Công Sở - Be (Cream) - Size 42	Be (Cream)	42	500000	100	SKU-6-10-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
601	122	Biti's Hunter Giày Sneaker Streetwear - Đỏ Đô - Size S	Đỏ Đô	S	680000	100	SKU-7-1-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
602	122	Biti's Hunter Giày Sneaker Streetwear - Xanh Navy - Size M	Xanh Navy	M	680000	100	SKU-7-1-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
603	122	Biti's Hunter Giày Sneaker Streetwear - Xám Khói - Size L	Xám Khói	L	680000	100	SKU-7-1-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
604	122	Biti's Hunter Giày Sneaker Streetwear - Be (Cream) - Size XL	Be (Cream)	XL	680000	100	SKU-7-1-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
605	122	Biti's Hunter Giày Sneaker Streetwear - Xanh Rêu - Size XXL	Xanh Rêu	XXL	680000	100	SKU-7-1-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
606	123	Ananas Giày Slip-on Basic - Xanh Navy - Size S	Xanh Navy	S	710000	100	SKU-7-2-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
607	123	Ananas Giày Slip-on Basic - Xám Khói - Size M	Xám Khói	M	710000	100	SKU-7-2-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
608	123	Ananas Giày Slip-on Basic - Be (Cream) - Size L	Be (Cream)	L	710000	100	SKU-7-2-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
609	123	Ananas Giày Slip-on Basic - Xanh Rêu - Size XL	Xanh Rêu	XL	710000	100	SKU-7-2-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
610	123	Ananas Giày Slip-on Basic - Hồng Pastel - Size XXL	Hồng Pastel	XXL	710000	100	SKU-7-2-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
611	124	RieNevan Giày Chạy Bộ Performance - Xám Khói - Size S	Xám Khói	S	740000	100	SKU-7-3-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
612	124	RieNevan Giày Chạy Bộ Performance - Be (Cream) - Size M	Be (Cream)	M	740000	100	SKU-7-3-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
613	124	RieNevan Giày Chạy Bộ Performance - Xanh Rêu - Size L	Xanh Rêu	L	740000	100	SKU-7-3-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
614	124	RieNevan Giày Chạy Bộ Performance - Hồng Pastel - Size XL	Hồng Pastel	XL	740000	100	SKU-7-3-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
615	124	RieNevan Giày Chạy Bộ Performance - Nâu Đất - Size XXL	Nâu Đất	XXL	740000	100	SKU-7-3-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
616	125	MWC Giày Thể Thao Cao Cổ - Be (Cream) - Size S	Be (Cream)	S	770000	100	SKU-7-4-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
617	125	MWC Giày Thể Thao Cao Cổ - Xanh Rêu - Size M	Xanh Rêu	M	770000	100	SKU-7-4-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
618	125	MWC Giày Thể Thao Cao Cổ - Hồng Pastel - Size L	Hồng Pastel	L	770000	100	SKU-7-4-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
619	125	MWC Giày Thể Thao Cao Cổ - Nâu Đất - Size XL	Nâu Đất	XL	770000	100	SKU-7-4-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
620	125	MWC Giày Thể Thao Cao Cổ - Vàng Mù Tạt - Size XXL	Vàng Mù Tạt	XXL	770000	100	SKU-7-4-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
621	126	Vento Giày Sandal Thể Thao - Xanh Rêu - Size S	Xanh Rêu	S	800000	100	SKU-7-5-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
622	126	Vento Giày Sandal Thể Thao - Hồng Pastel - Size M	Hồng Pastel	M	800000	100	SKU-7-5-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
623	126	Vento Giày Sandal Thể Thao - Nâu Đất - Size L	Nâu Đất	L	800000	100	SKU-7-5-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
624	126	Vento Giày Sandal Thể Thao - Vàng Mù Tạt - Size XL	Vàng Mù Tạt	XL	800000	100	SKU-7-5-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
625	126	Vento Giày Sandal Thể Thao - Đen Tuyền - Size XXL	Đen Tuyền	XXL	800000	100	SKU-7-5-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
626	127	Miti Giày Sneaker Da Lộn - Hồng Pastel - Size S	Hồng Pastel	S	830000	100	SKU-7-6-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
627	127	Miti Giày Sneaker Da Lộn - Nâu Đất - Size M	Nâu Đất	M	830000	100	SKU-7-6-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
628	127	Miti Giày Sneaker Da Lộn - Vàng Mù Tạt - Size L	Vàng Mù Tạt	L	830000	100	SKU-7-6-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
629	127	Miti Giày Sneaker Da Lộn - Đen Tuyền - Size XL	Đen Tuyền	XL	830000	100	SKU-7-6-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
630	127	Miti Giày Sneaker Da Lộn - Trắng Basic - Size XXL	Trắng Basic	XXL	830000	100	SKU-7-6-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
631	128	Skechers Giày Tập Gym Êm Ái - Nâu Đất - Size S	Nâu Đất	S	860000	100	SKU-7-7-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
632	128	Skechers Giày Tập Gym Êm Ái - Vàng Mù Tạt - Size M	Vàng Mù Tạt	M	860000	100	SKU-7-7-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
633	128	Skechers Giày Tập Gym Êm Ái - Đen Tuyền - Size L	Đen Tuyền	L	860000	100	SKU-7-7-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
634	128	Skechers Giày Tập Gym Êm Ái - Trắng Basic - Size XL	Trắng Basic	XL	860000	100	SKU-7-7-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
635	128	Skechers Giày Tập Gym Êm Ái - Đỏ Đô - Size XXL	Đỏ Đô	XXL	860000	100	SKU-7-7-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
636	129	Thượng Đình Giày Sneaker Vintage - Vàng Mù Tạt - Size S	Vàng Mù Tạt	S	890000	100	SKU-7-8-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
637	129	Thượng Đình Giày Sneaker Vintage - Đen Tuyền - Size M	Đen Tuyền	M	890000	100	SKU-7-8-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
638	129	Thượng Đình Giày Sneaker Vintage - Trắng Basic - Size L	Trắng Basic	L	890000	100	SKU-7-8-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
639	129	Thượng Đình Giày Sneaker Vintage - Đỏ Đô - Size XL	Đỏ Đô	XL	890000	100	SKU-7-8-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
640	129	Thượng Đình Giày Sneaker Vintage - Xanh Navy - Size XXL	Xanh Navy	XXL	890000	100	SKU-7-8-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
641	130	Asia Sport Giày Thể Thao Nam Nữ - Đen Tuyền - Size S	Đen Tuyền	S	920000	100	SKU-7-9-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
642	130	Asia Sport Giày Thể Thao Nam Nữ - Trắng Basic - Size M	Trắng Basic	M	920000	100	SKU-7-9-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
643	130	Asia Sport Giày Thể Thao Nam Nữ - Đỏ Đô - Size L	Đỏ Đô	L	920000	100	SKU-7-9-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
644	130	Asia Sport Giày Thể Thao Nam Nữ - Xanh Navy - Size XL	Xanh Navy	XL	920000	100	SKU-7-9-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
645	130	Asia Sport Giày Thể Thao Nam Nữ - Xám Khói - Size XXL	Xám Khói	XXL	920000	100	SKU-7-9-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
646	131	Zoro Giày Sneaker Đế Cao - Trắng Basic - Size S	Trắng Basic	S	950000	100	SKU-7-10-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
647	131	Zoro Giày Sneaker Đế Cao - Đỏ Đô - Size M	Đỏ Đô	M	950000	100	SKU-7-10-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
648	131	Zoro Giày Sneaker Đế Cao - Xanh Navy - Size L	Xanh Navy	L	950000	100	SKU-7-10-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
649	131	Zoro Giày Sneaker Đế Cao - Xám Khói - Size XL	Xám Khói	XL	950000	100	SKU-7-10-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
650	131	Zoro Giày Sneaker Đế Cao - Be (Cream) - Size XXL	Be (Cream)	XXL	950000	100	SKU-7-10-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
651	132	LaForce Giày Oxford Da Bò - Đỏ Đô - Size S	Đỏ Đô	S	900000	100	SKU-8-1-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
652	132	LaForce Giày Oxford Da Bò - Xanh Navy - Size M	Xanh Navy	M	900000	100	SKU-8-1-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
653	132	LaForce Giày Oxford Da Bò - Xám Khói - Size L	Xám Khói	L	900000	100	SKU-8-1-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
654	132	LaForce Giày Oxford Da Bò - Be (Cream) - Size XL	Be (Cream)	XL	900000	100	SKU-8-1-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
655	132	LaForce Giày Oxford Da Bò - Xanh Rêu - Size XXL	Xanh Rêu	XXL	900000	100	SKU-8-1-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
656	133	Tâm Anh Giày Loafer Lịch Lãm - Xanh Navy - Size S	Xanh Navy	S	950000	100	SKU-8-2-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
657	133	Tâm Anh Giày Loafer Lịch Lãm - Xám Khói - Size M	Xám Khói	M	950000	100	SKU-8-2-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
658	133	Tâm Anh Giày Loafer Lịch Lãm - Be (Cream) - Size L	Be (Cream)	L	950000	100	SKU-8-2-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
659	133	Tâm Anh Giày Loafer Lịch Lãm - Xanh Rêu - Size XL	Xanh Rêu	XL	950000	100	SKU-8-2-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
660	133	Tâm Anh Giày Loafer Lịch Lãm - Hồng Pastel - Size XXL	Hồng Pastel	XXL	950000	100	SKU-8-2-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
661	134	Bitis Giày Derby Cổ Điển - Xám Khói - Size S	Xám Khói	S	1000000	100	SKU-8-3-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
662	134	Bitis Giày Derby Cổ Điển - Be (Cream) - Size M	Be (Cream)	M	1000000	100	SKU-8-3-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
663	134	Bitis Giày Derby Cổ Điển - Xanh Rêu - Size L	Xanh Rêu	L	1000000	100	SKU-8-3-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
664	134	Bitis Giày Derby Cổ Điển - Hồng Pastel - Size XL	Hồng Pastel	XL	1000000	100	SKU-8-3-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
665	134	Bitis Giày Derby Cổ Điển - Nâu Đất - Size XXL	Nâu Đất	XXL	1000000	100	SKU-8-3-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
666	135	Leonardo Giày Mọi Da Thật - Be (Cream) - Size S	Be (Cream)	S	1050000	100	SKU-8-4-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
667	135	Leonardo Giày Mọi Da Thật - Xanh Rêu - Size M	Xanh Rêu	M	1050000	100	SKU-8-4-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
668	135	Leonardo Giày Mọi Da Thật - Hồng Pastel - Size L	Hồng Pastel	L	1050000	100	SKU-8-4-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
669	135	Leonardo Giày Mọi Da Thật - Nâu Đất - Size XL	Nâu Đất	XL	1050000	100	SKU-8-4-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
670	135	Leonardo Giày Mọi Da Thật - Vàng Mù Tạt - Size XXL	Vàng Mù Tạt	XXL	1050000	100	SKU-8-4-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
672	136	Zapatos Giày Chelsea Boots - Hồng Pastel - Size M	Hồng Pastel	M	1100000	100	SKU-8-5-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
673	136	Zapatos Giày Chelsea Boots - Nâu Đất - Size L	Nâu Đất	L	1100000	100	SKU-8-5-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
674	136	Zapatos Giày Chelsea Boots - Vàng Mù Tạt - Size XL	Vàng Mù Tạt	XL	1100000	100	SKU-8-5-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
675	136	Zapatos Giày Chelsea Boots - Đen Tuyền - Size XXL	Đen Tuyền	XXL	1100000	100	SKU-8-5-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
676	137	Smartmen Giày Tây Công Sở - Hồng Pastel - Size S	Hồng Pastel	S	1150000	100	SKU-8-6-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
677	137	Smartmen Giày Tây Công Sở - Nâu Đất - Size M	Nâu Đất	M	1150000	100	SKU-8-6-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
678	137	Smartmen Giày Tây Công Sở - Vàng Mù Tạt - Size L	Vàng Mù Tạt	L	1150000	100	SKU-8-6-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
679	137	Smartmen Giày Tây Công Sở - Đen Tuyền - Size XL	Đen Tuyền	XL	1150000	100	SKU-8-6-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
680	137	Smartmen Giày Tây Công Sở - Trắng Basic - Size XXL	Trắng Basic	XXL	1150000	100	SKU-8-6-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
681	138	Giày Việt Giày Monkstrap - Nâu Đất - Size S	Nâu Đất	S	1200000	100	SKU-8-7-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
682	138	Giày Việt Giày Monkstrap - Vàng Mù Tạt - Size M	Vàng Mù Tạt	M	1200000	100	SKU-8-7-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
683	138	Giày Việt Giày Monkstrap - Đen Tuyền - Size L	Đen Tuyền	L	1200000	100	SKU-8-7-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
684	138	Giày Việt Giày Monkstrap - Trắng Basic - Size XL	Trắng Basic	XL	1200000	100	SKU-8-7-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
685	138	Giày Việt Giày Monkstrap - Đỏ Đô - Size XXL	Đỏ Đô	XXL	1200000	100	SKU-8-7-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
686	139	Ananas Giày Da Nam Cao Cấp - Vàng Mù Tạt - Size S	Vàng Mù Tạt	S	1250000	100	SKU-8-8-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
687	139	Ananas Giày Da Nam Cao Cấp - Đen Tuyền - Size M	Đen Tuyền	M	1250000	100	SKU-8-8-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
688	139	Ananas Giày Da Nam Cao Cấp - Trắng Basic - Size L	Trắng Basic	L	1250000	100	SKU-8-8-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
689	139	Ananas Giày Da Nam Cao Cấp - Đỏ Đô - Size XL	Đỏ Đô	XL	1250000	100	SKU-8-8-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
690	139	Ananas Giày Da Nam Cao Cấp - Xanh Navy - Size XXL	Xanh Navy	XXL	1250000	100	SKU-8-8-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
691	140	Pierre Cardin Giày Sục Da - Đen Tuyền - Size S	Đen Tuyền	S	1300000	100	SKU-8-9-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
692	140	Pierre Cardin Giày Sục Da - Trắng Basic - Size M	Trắng Basic	M	1300000	100	SKU-8-9-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
693	140	Pierre Cardin Giày Sục Da - Đỏ Đô - Size L	Đỏ Đô	L	1300000	100	SKU-8-9-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
694	140	Pierre Cardin Giày Sục Da - Xanh Navy - Size XL	Xanh Navy	XL	1300000	100	SKU-8-9-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
695	140	Pierre Cardin Giày Sục Da - Xám Khói - Size XXL	Xám Khói	XXL	1300000	100	SKU-8-9-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
696	141	Oxford Giày Da Thủ Công - Trắng Basic - Size S	Trắng Basic	S	1350000	100	SKU-8-10-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
697	141	Oxford Giày Da Thủ Công - Đỏ Đô - Size M	Đỏ Đô	M	1350000	100	SKU-8-10-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
698	141	Oxford Giày Da Thủ Công - Xanh Navy - Size L	Xanh Navy	L	1350000	100	SKU-8-10-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
699	141	Oxford Giày Da Thủ Công - Xám Khói - Size XL	Xám Khói	XL	1350000	100	SKU-8-10-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
700	141	Oxford Giày Da Thủ Công - Be (Cream) - Size XXL	Be (Cream)	XXL	1350000	100	SKU-8-10-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
701	142	MLB Nón Kết NY Yankees - Đỏ Đô - Size S	Đỏ Đô	S	155000	100	SKU-9-1-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
702	142	MLB Nón Kết NY Yankees - Xanh Navy - Size M	Xanh Navy	M	155000	100	SKU-9-1-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
703	142	MLB Nón Kết NY Yankees - Xám Khói - Size L	Xám Khói	L	155000	100	SKU-9-1-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
704	142	MLB Nón Kết NY Yankees - Be (Cream) - Size XL	Be (Cream)	XL	155000	100	SKU-9-1-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
705	142	MLB Nón Kết NY Yankees - Xanh Rêu - Size XXL	Xanh Rêu	XXL	155000	100	SKU-9-1-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
706	143	Premi3r Nón Bucket Local Brand - Xanh Navy - Size S	Xanh Navy	S	160000	100	SKU-9-2-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
707	143	Premi3r Nón Bucket Local Brand - Xám Khói - Size M	Xám Khói	M	160000	100	SKU-9-2-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
708	143	Premi3r Nón Bucket Local Brand - Be (Cream) - Size L	Be (Cream)	L	160000	100	SKU-9-2-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
709	143	Premi3r Nón Bucket Local Brand - Xanh Rêu - Size XL	Xanh Rêu	XL	160000	100	SKU-9-2-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
710	143	Premi3r Nón Bucket Local Brand - Hồng Pastel - Size XXL	Hồng Pastel	XXL	160000	100	SKU-9-2-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
711	144	Grimm DC Mũ Lưỡi Trai Basic - Xám Khói - Size S	Xám Khói	S	165000	100	SKU-9-3-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
712	144	Grimm DC Mũ Lưỡi Trai Basic - Be (Cream) - Size M	Be (Cream)	M	165000	100	SKU-9-3-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
713	144	Grimm DC Mũ Lưỡi Trai Basic - Xanh Rêu - Size L	Xanh Rêu	L	165000	100	SKU-9-3-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
714	144	Grimm DC Mũ Lưỡi Trai Basic - Hồng Pastel - Size XL	Hồng Pastel	XL	165000	100	SKU-9-3-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
715	144	Grimm DC Mũ Lưỡi Trai Basic - Nâu Đất - Size XXL	Nâu Đất	XXL	165000	100	SKU-9-3-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
716	145	DirtyCoins Nón Beanie Len - Be (Cream) - Size S	Be (Cream)	S	170000	100	SKU-9-4-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
717	145	DirtyCoins Nón Beanie Len - Xanh Rêu - Size M	Xanh Rêu	M	170000	100	SKU-9-4-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
718	145	DirtyCoins Nón Beanie Len - Hồng Pastel - Size L	Hồng Pastel	L	170000	100	SKU-9-4-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
719	145	DirtyCoins Nón Beanie Len - Nâu Đất - Size XL	Nâu Đất	XL	170000	100	SKU-9-4-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
720	145	DirtyCoins Nón Beanie Len - Vàng Mù Tạt - Size XXL	Vàng Mù Tạt	XXL	170000	100	SKU-9-4-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
721	146	Levents Nón Snapback Hip-hop - Xanh Rêu - Size S	Xanh Rêu	S	175000	100	SKU-9-5-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
722	146	Levents Nón Snapback Hip-hop - Hồng Pastel - Size M	Hồng Pastel	M	175000	100	SKU-9-5-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
723	146	Levents Nón Snapback Hip-hop - Nâu Đất - Size L	Nâu Đất	L	175000	100	SKU-9-5-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
724	146	Levents Nón Snapback Hip-hop - Vàng Mù Tạt - Size XL	Vàng Mù Tạt	XL	175000	100	SKU-9-5-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
725	146	Levents Nón Snapback Hip-hop - Đen Tuyền - Size XXL	Đen Tuyền	XXL	175000	100	SKU-9-5-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
726	147	Hades Mũ Beret Thời Trang - Hồng Pastel - Size S	Hồng Pastel	S	180000	100	SKU-9-6-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
727	147	Hades Mũ Beret Thời Trang - Nâu Đất - Size M	Nâu Đất	M	180000	100	SKU-9-6-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
728	147	Hades Mũ Beret Thời Trang - Vàng Mù Tạt - Size L	Vàng Mù Tạt	L	180000	100	SKU-9-6-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
729	147	Hades Mũ Beret Thời Trang - Đen Tuyền - Size XL	Đen Tuyền	XL	180000	100	SKU-9-6-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
730	147	Hades Mũ Beret Thời Trang - Trắng Basic - Size XXL	Trắng Basic	XXL	180000	100	SKU-9-6-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
731	148	Degrey Nón Kết Thêu Logo - Nâu Đất - Size S	Nâu Đất	S	185000	100	SKU-9-7-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
732	148	Degrey Nón Kết Thêu Logo - Vàng Mù Tạt - Size M	Vàng Mù Tạt	M	185000	100	SKU-9-7-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
733	148	Degrey Nón Kết Thêu Logo - Đen Tuyền - Size L	Đen Tuyền	L	185000	100	SKU-9-7-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
734	148	Degrey Nón Kết Thêu Logo - Trắng Basic - Size XL	Trắng Basic	XL	185000	100	SKU-9-7-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
735	148	Degrey Nón Kết Thêu Logo - Đỏ Đô - Size XXL	Đỏ Đô	XXL	185000	100	SKU-9-7-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
736	149	Coolmate Nón Tai Bèo Chống Nắng - Vàng Mù Tạt - Size S	Vàng Mù Tạt	S	190000	100	SKU-9-8-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
737	149	Coolmate Nón Tai Bèo Chống Nắng - Đen Tuyền - Size M	Đen Tuyền	M	190000	100	SKU-9-8-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
738	149	Coolmate Nón Tai Bèo Chống Nắng - Trắng Basic - Size L	Trắng Basic	L	190000	100	SKU-9-8-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
739	149	Coolmate Nón Tai Bèo Chống Nắng - Đỏ Đô - Size XL	Đỏ Đô	XL	190000	100	SKU-9-8-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
740	149	Coolmate Nón Tai Bèo Chống Nắng - Xanh Navy - Size XXL	Xanh Navy	XXL	190000	100	SKU-9-8-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
741	150	Nón Sơn Nón Kết Kaki - Đen Tuyền - Size S	Đen Tuyền	S	195000	100	SKU-9-9-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
742	150	Nón Sơn Nón Kết Kaki - Trắng Basic - Size M	Trắng Basic	M	195000	100	SKU-9-9-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
743	150	Nón Sơn Nón Kết Kaki - Đỏ Đô - Size L	Đỏ Đô	L	195000	100	SKU-9-9-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
744	150	Nón Sơn Nón Kết Kaki - Xanh Navy - Size XL	Xanh Navy	XL	195000	100	SKU-9-9-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
745	150	Nón Sơn Nón Kết Kaki - Xám Khói - Size XXL	Xám Khói	XXL	195000	100	SKU-9-9-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
746	151	Yame Nón Snapback Classic - Trắng Basic - Size S	Trắng Basic	S	200000	100	SKU-9-10-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
747	151	Yame Nón Snapback Classic - Đỏ Đô - Size M	Đỏ Đô	M	200000	100	SKU-9-10-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
748	151	Yame Nón Snapback Classic - Xanh Navy - Size L	Xanh Navy	L	200000	100	SKU-9-10-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
749	151	Yame Nón Snapback Classic - Xám Khói - Size XL	Xám Khói	XL	200000	100	SKU-9-10-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
750	151	Yame Nón Snapback Classic - Be (Cream) - Size XXL	Be (Cream)	XXL	200000	100	SKU-9-10-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
751	152	Leonardo Thắt Lưng Da Miếng - Đỏ Đô - Size S	Đỏ Đô	S	119000	100	SKU-10-1-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
752	152	Leonardo Thắt Lưng Da Miếng - Xanh Navy - Size M	Xanh Navy	M	119000	100	SKU-10-1-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
753	152	Leonardo Thắt Lưng Da Miếng - Xám Khói - Size L	Xám Khói	L	119000	100	SKU-10-1-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
754	152	Leonardo Thắt Lưng Da Miếng - Be (Cream) - Size XL	Be (Cream)	XL	119000	100	SKU-10-1-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
755	152	Leonardo Thắt Lưng Da Miếng - Xanh Rêu - Size XXL	Xanh Rêu	XXL	119000	100	SKU-10-1-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
756	153	KaLong Ví Da Bò Saffiano - Xanh Navy - Size S	Xanh Navy	S	139000	100	SKU-10-2-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
757	153	KaLong Ví Da Bò Saffiano - Xám Khói - Size M	Xám Khói	M	139000	100	SKU-10-2-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
758	153	KaLong Ví Da Bò Saffiano - Be (Cream) - Size L	Be (Cream)	L	139000	100	SKU-10-2-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
759	153	KaLong Ví Da Bò Saffiano - Xanh Rêu - Size XL	Xanh Rêu	XL	139000	100	SKU-10-2-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
760	153	KaLong Ví Da Bò Saffiano - Hồng Pastel - Size XXL	Hồng Pastel	XXL	139000	100	SKU-10-2-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
761	154	Midori Tất Cổ Cao Cotton - Xám Khói - Size S	Xám Khói	S	159000	100	SKU-10-3-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
762	154	Midori Tất Cổ Cao Cotton - Be (Cream) - Size M	Be (Cream)	M	159000	100	SKU-10-3-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
763	154	Midori Tất Cổ Cao Cotton - Xanh Rêu - Size L	Xanh Rêu	L	159000	100	SKU-10-3-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
764	154	Midori Tất Cổ Cao Cotton - Hồng Pastel - Size XL	Hồng Pastel	XL	159000	100	SKU-10-3-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
765	154	Midori Tất Cổ Cao Cotton - Nâu Đất - Size XXL	Nâu Đất	XXL	159000	100	SKU-10-3-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
766	155	Coolmate Túi Đeo Chéo Canvas - Be (Cream) - Size S	Be (Cream)	S	179000	100	SKU-10-4-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
767	155	Coolmate Túi Đeo Chéo Canvas - Xanh Rêu - Size M	Xanh Rêu	M	179000	100	SKU-10-4-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
768	155	Coolmate Túi Đeo Chéo Canvas - Hồng Pastel - Size L	Hồng Pastel	L	179000	100	SKU-10-4-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
769	155	Coolmate Túi Đeo Chéo Canvas - Nâu Đất - Size XL	Nâu Đất	XL	179000	100	SKU-10-4-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
770	155	Coolmate Túi Đeo Chéo Canvas - Vàng Mù Tạt - Size XXL	Vàng Mù Tạt	XXL	179000	100	SKU-10-4-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
771	156	Levents Ví Đựng Thẻ Card Holder - Xanh Rêu - Size S	Xanh Rêu	S	199000	100	SKU-10-5-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
772	156	Levents Ví Đựng Thẻ Card Holder - Hồng Pastel - Size M	Hồng Pastel	M	199000	100	SKU-10-5-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
773	156	Levents Ví Đựng Thẻ Card Holder - Nâu Đất - Size L	Nâu Đất	L	199000	100	SKU-10-5-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
774	156	Levents Ví Đựng Thẻ Card Holder - Vàng Mù Tạt - Size XL	Vàng Mù Tạt	XL	199000	100	SKU-10-5-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
775	156	Levents Ví Đựng Thẻ Card Holder - Đen Tuyền - Size XXL	Đen Tuyền	XXL	199000	100	SKU-10-5-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
776	157	DirtyCoins Thắt Lưng Mặt Khóa Kim - Hồng Pastel - Size S	Hồng Pastel	S	219000	100	SKU-10-6-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
777	157	DirtyCoins Thắt Lưng Mặt Khóa Kim - Nâu Đất - Size M	Nâu Đất	M	219000	100	SKU-10-6-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
778	157	DirtyCoins Thắt Lưng Mặt Khóa Kim - Vàng Mù Tạt - Size L	Vàng Mù Tạt	L	219000	100	SKU-10-6-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
779	157	DirtyCoins Thắt Lưng Mặt Khóa Kim - Đen Tuyền - Size XL	Đen Tuyền	XL	219000	100	SKU-10-6-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
780	157	DirtyCoins Thắt Lưng Mặt Khóa Kim - Trắng Basic - Size XXL	Trắng Basic	XXL	219000	100	SKU-10-6-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
781	158	Routine Tất Thể Thao Khử Mùi - Nâu Đất - Size S	Nâu Đất	S	239000	100	SKU-10-7-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
782	158	Routine Tất Thể Thao Khử Mùi - Vàng Mù Tạt - Size M	Vàng Mù Tạt	M	239000	100	SKU-10-7-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
783	158	Routine Tất Thể Thao Khử Mùi - Đen Tuyền - Size L	Đen Tuyền	L	239000	100	SKU-10-7-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
784	158	Routine Tất Thể Thao Khử Mùi - Trắng Basic - Size XL	Trắng Basic	XL	239000	100	SKU-10-7-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
785	158	Routine Tất Thể Thao Khử Mùi - Đỏ Đô - Size XXL	Đỏ Đô	XXL	239000	100	SKU-10-7-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
786	159	Ananas Túi Tote Thời Trang - Vàng Mù Tạt - Size S	Vàng Mù Tạt	S	259000	100	SKU-10-8-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
787	159	Ananas Túi Tote Thời Trang - Đen Tuyền - Size M	Đen Tuyền	M	259000	100	SKU-10-8-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
788	159	Ananas Túi Tote Thời Trang - Trắng Basic - Size L	Trắng Basic	L	259000	100	SKU-10-8-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
789	159	Ananas Túi Tote Thời Trang - Đỏ Đô - Size XL	Đỏ Đô	XL	259000	100	SKU-10-8-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
790	159	Ananas Túi Tote Thời Trang - Xanh Navy - Size XXL	Xanh Navy	XXL	259000	100	SKU-10-8-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
791	160	Zoro Ví Dài Unisex - Đen Tuyền - Size S	Đen Tuyền	S	279000	100	SKU-10-9-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
792	160	Zoro Ví Dài Unisex - Trắng Basic - Size M	Trắng Basic	M	279000	100	SKU-10-9-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
793	160	Zoro Ví Dài Unisex - Đỏ Đô - Size L	Đỏ Đô	L	279000	100	SKU-10-9-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
794	160	Zoro Ví Dài Unisex - Xanh Navy - Size XL	Xanh Navy	XL	279000	100	SKU-10-9-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
795	160	Zoro Ví Dài Unisex - Xám Khói - Size XXL	Xám Khói	XXL	279000	100	SKU-10-9-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
796	161	Owen Cà Vạt Lụa Cao Cấp - Trắng Basic - Size S	Trắng Basic	S	299000	100	SKU-10-10-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
797	161	Owen Cà Vạt Lụa Cao Cấp - Đỏ Đô - Size M	Đỏ Đô	M	299000	100	SKU-10-10-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
798	161	Owen Cà Vạt Lụa Cao Cấp - Xanh Navy - Size L	Xanh Navy	L	299000	100	SKU-10-10-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
799	161	Owen Cà Vạt Lụa Cao Cấp - Xám Khói - Size XL	Xám Khói	XL	299000	100	SKU-10-10-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
800	161	Owen Cà Vạt Lụa Cao Cấp - Be (Cream) - Size XXL	Be (Cream)	XXL	299000	100	SKU-10-10-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
801	162	DirtyCoins Áo Hoodie Big Logo - Đỏ Đô - Size S	Đỏ Đô	S	475000	100	SKU-11-1-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
802	162	DirtyCoins Áo Hoodie Big Logo - Xanh Navy - Size M	Xanh Navy	M	475000	100	SKU-11-1-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
803	162	DirtyCoins Áo Hoodie Big Logo - Xám Khói - Size L	Xám Khói	L	475000	100	SKU-11-1-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
804	162	DirtyCoins Áo Hoodie Big Logo - Be (Cream) - Size XL	Be (Cream)	XL	475000	100	SKU-11-1-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
805	162	DirtyCoins Áo Hoodie Big Logo - Xanh Rêu - Size XXL	Xanh Rêu	XXL	475000	100	SKU-11-1-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
806	163	Levents Áo Khoác Bomber Streetwear - Xanh Navy - Size S	Xanh Navy	S	500000	100	SKU-11-2-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
807	163	Levents Áo Khoác Bomber Streetwear - Xám Khói - Size M	Xám Khói	M	500000	100	SKU-11-2-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
808	163	Levents Áo Khoác Bomber Streetwear - Be (Cream) - Size L	Be (Cream)	L	500000	100	SKU-11-2-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
809	163	Levents Áo Khoác Bomber Streetwear - Xanh Rêu - Size XL	Xanh Rêu	XL	500000	100	SKU-11-2-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
810	163	Levents Áo Khoác Bomber Streetwear - Hồng Pastel - Size XXL	Hồng Pastel	XXL	500000	100	SKU-11-2-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
811	164	Hades Áo Varsity Jacket - Xám Khói - Size S	Xám Khói	S	525000	100	SKU-11-3-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
812	164	Hades Áo Varsity Jacket - Be (Cream) - Size M	Be (Cream)	M	525000	100	SKU-11-3-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
813	164	Hades Áo Varsity Jacket - Xanh Rêu - Size L	Xanh Rêu	L	525000	100	SKU-11-3-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
814	164	Hades Áo Varsity Jacket - Hồng Pastel - Size XL	Hồng Pastel	XL	525000	100	SKU-11-3-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
815	164	Hades Áo Varsity Jacket - Nâu Đất - Size XXL	Nâu Đất	XXL	525000	100	SKU-11-3-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
816	165	Degrey Áo Khoác Gió Chống Nước - Be (Cream) - Size S	Be (Cream)	S	550000	100	SKU-11-4-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
817	165	Degrey Áo Khoác Gió Chống Nước - Xanh Rêu - Size M	Xanh Rêu	M	550000	100	SKU-11-4-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
818	165	Degrey Áo Khoác Gió Chống Nước - Hồng Pastel - Size L	Hồng Pastel	L	550000	100	SKU-11-4-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
819	165	Degrey Áo Khoác Gió Chống Nước - Nâu Đất - Size XL	Nâu Đất	XL	550000	100	SKU-11-4-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
820	165	Degrey Áo Khoác Gió Chống Nước - Vàng Mù Tạt - Size XXL	Vàng Mù Tạt	XXL	550000	100	SKU-11-4-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
821	166	5theway Áo Hoodie Oversize - Xanh Rêu - Size S	Xanh Rêu	S	575000	100	SKU-11-5-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	7	5	25	350	18	VND	t	0
822	166	5theway Áo Hoodie Oversize - Hồng Pastel - Size M	Hồng Pastel	M	575000	100	SKU-11-5-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
823	166	5theway Áo Hoodie Oversize - Nâu Đất - Size L	Nâu Đất	L	575000	100	SKU-11-5-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
824	166	5theway Áo Hoodie Oversize - Vàng Mù Tạt - Size XL	Vàng Mù Tạt	XL	575000	100	SKU-11-5-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
825	166	5theway Áo Hoodie Oversize - Đen Tuyền - Size XXL	Đen Tuyền	XXL	575000	100	SKU-11-5-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
826	167	Clownz Áo Khoác Kaki Form Rộng - Hồng Pastel - Size S	Hồng Pastel	S	600000	100	SKU-11-6-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	8	5	25	350	18	VND	t	0
827	167	Clownz Áo Khoác Kaki Form Rộng - Nâu Đất - Size M	Nâu Đất	M	600000	100	SKU-11-6-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
828	167	Clownz Áo Khoác Kaki Form Rộng - Vàng Mù Tạt - Size L	Vàng Mù Tạt	L	600000	100	SKU-11-6-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
829	167	Clownz Áo Khoác Kaki Form Rộng - Đen Tuyền - Size XL	Đen Tuyền	XL	600000	100	SKU-11-6-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
830	167	Clownz Áo Khoác Kaki Form Rộng - Trắng Basic - Size XXL	Trắng Basic	XXL	600000	100	SKU-11-6-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
831	168	Outerity Áo Sweater Nỉ Bông - Nâu Đất - Size S	Nâu Đất	S	625000	100	SKU-11-7-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	9	5	25	350	18	VND	t	0
832	168	Outerity Áo Sweater Nỉ Bông - Vàng Mù Tạt - Size M	Vàng Mù Tạt	M	625000	100	SKU-11-7-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
833	168	Outerity Áo Sweater Nỉ Bông - Đen Tuyền - Size L	Đen Tuyền	L	625000	100	SKU-11-7-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
834	168	Outerity Áo Sweater Nỉ Bông - Trắng Basic - Size XL	Trắng Basic	XL	625000	100	SKU-11-7-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
835	168	Outerity Áo Sweater Nỉ Bông - Đỏ Đô - Size XXL	Đỏ Đô	XXL	625000	100	SKU-11-7-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
836	169	Routine Áo Khoác Denim - Vàng Mù Tạt - Size S	Vàng Mù Tạt	S	650000	100	SKU-11-8-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	10	5	25	350	18	VND	t	0
837	169	Routine Áo Khoác Denim - Đen Tuyền - Size M	Đen Tuyền	M	650000	100	SKU-11-8-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
838	169	Routine Áo Khoác Denim - Trắng Basic - Size L	Trắng Basic	L	650000	100	SKU-11-8-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
839	169	Routine Áo Khoác Denim - Đỏ Đô - Size XL	Đỏ Đô	XL	650000	100	SKU-11-8-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
840	169	Routine Áo Khoác Denim - Xanh Navy - Size XXL	Xanh Navy	XXL	650000	100	SKU-11-8-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
841	170	Coolmate Áo Hoodie Phối Màu - Đen Tuyền - Size S	Đen Tuyền	S	675000	100	SKU-11-9-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	1	5	25	350	18	VND	t	0
842	170	Coolmate Áo Hoodie Phối Màu - Trắng Basic - Size M	Trắng Basic	M	675000	100	SKU-11-9-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
843	170	Coolmate Áo Hoodie Phối Màu - Đỏ Đô - Size L	Đỏ Đô	L	675000	100	SKU-11-9-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
844	170	Coolmate Áo Hoodie Phối Màu - Xanh Navy - Size XL	Xanh Navy	XL	675000	100	SKU-11-9-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
845	170	Coolmate Áo Hoodie Phối Màu - Xám Khói - Size XXL	Xám Khói	XXL	675000	100	SKU-11-9-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
846	171	Canifa Áo Khoác Hoodie Zipper - Trắng Basic - Size S	Trắng Basic	S	700000	100	SKU-11-10-VAR1	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	2	5	25	350	18	VND	t	0
847	171	Canifa Áo Khoác Hoodie Zipper - Đỏ Đô - Size M	Đỏ Đô	M	700000	100	SKU-11-10-VAR2	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	3	5	25	350	18	VND	t	0
848	171	Canifa Áo Khoác Hoodie Zipper - Xanh Navy - Size L	Xanh Navy	L	700000	100	SKU-11-10-VAR3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	4	5	25	350	18	VND	t	0
849	171	Canifa Áo Khoác Hoodie Zipper - Xám Khói - Size XL	Xám Khói	XL	700000	100	SKU-11-10-VAR4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	5	5	25	350	18	VND	t	0
850	171	Canifa Áo Khoác Hoodie Zipper - Be (Cream) - Size XXL	Be (Cream)	XXL	700000	100	SKU-11-10-VAR5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	6	5	25	350	18	VND	t	0
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
408	83	Routine Áo Polo Excool	Be (Cream)	L	209000	100	SKU-3-2-VAR3	2026-04-16 03:21:41.99	2026-04-16 12:29:20.545	1	\N	6	5	25	350	18	VND	t	0
409	83	Routine Áo Polo Excool	Xanh Rêu	XL	209000	100	SKU-3-2-VAR4	2026-04-16 03:21:41.99	2026-04-16 12:29:20.548	1	\N	7	5	25	350	18	VND	t	0
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
\.


--
-- TOC entry 3861 (class 0 OID 72702)
-- Dependencies: 225
-- Data for Name: Products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Products" (id, name, description, price, "stockKeepingUnit", stock, "categoryId", "createdAt", "updatedAt", "createByUserId", "voucherId", "currencyUnit") FROM stdin;
88	Clownz Áo Polo Thể Thao	Sản phẩm Clownz Áo Polo Thể Thao thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	259000	SKU-3-7	500	3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
89	Hades Áo Thun In Hình	Sản phẩm Hades Áo Thun In Hình thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	269000	SKU-3-8	500	3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
90	Bobui Áo Polo Phối Bo	Sản phẩm Bobui Áo Polo Phối Bo thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	279000	SKU-3-9	500	3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
91	Degrey Áo Thun Tay Lỡ	Sản phẩm Degrey Áo Thun Tay Lỡ thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	289000	SKU-3-10	500	3	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
92	Owen Sơ Mi Trắng Công Sở	Sản phẩm Owen Sơ Mi Trắng Công Sở thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	365000	SKU-4-1	500	4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
93	Aristino Sơ Mi Flannel Kẻ Caro	Sản phẩm Aristino Sơ Mi Flannel Kẻ Caro thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	380000	SKU-4-2	500	4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
94	Routine Sơ Mi Bamboo Kháng Khuẩn	Sản phẩm Routine Sơ Mi Bamboo Kháng Khuẩn thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	395000	SKU-4-3	500	4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
95	Viet Tien Sơ Mi Oxford Basic	Sản phẩm Viet Tien Sơ Mi Oxford Basic thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	410000	SKU-4-4	500	4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
96	SSStutter Sơ Mi Cổ Tàu	Sản phẩm SSStutter Sơ Mi Cổ Tàu thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	425000	SKU-4-5	500	4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
97	An Phước Sơ Mi Họa Tiết Tropical	Sản phẩm An Phước Sơ Mi Họa Tiết Tropical thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	440000	SKU-4-6	500	4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
98	The Blues Sơ Mi Denim Bền Bỉ	Sản phẩm The Blues Sơ Mi Denim Bền Bỉ thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	455000	SKU-4-7	500	4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
99	Canifa Sơ Mi Linen Thoáng Mát	Sản phẩm Canifa Sơ Mi Linen Thoáng Mát thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	470000	SKU-4-8	500	4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
100	Mattana Sơ Mi Slimfit	Sản phẩm Mattana Sơ Mi Slimfit thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	485000	SKU-4-9	500	4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
101	Bambo Sơ Mi Cổ Cuban	Sản phẩm Bambo Sơ Mi Cổ Cuban thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	500000	SKU-4-10	500	4	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
102	Routine Quần Jean Slim Fit	Sản phẩm Routine Quần Jean Slim Fit thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	470000	SKU-5-1	500	5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
103	GenViet Quần Jean Ống Rộng	Sản phẩm GenViet Quần Jean Ống Rộng thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	490000	SKU-5-2	500	5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
104	Copper Denim Quần Jean Baggy Nam	Sản phẩm Copper Denim Quần Jean Baggy Nam thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	510000	SKU-5-3	500	5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
105	Levi's Quần Jean Skinny Co Giãn	Sản phẩm Levi's Quần Jean Skinny Co Giãn thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	530000	SKU-5-4	500	5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
106	DirtyCoins Quần Jean Rách Gối	Sản phẩm DirtyCoins Quần Jean Rách Gối thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	550000	SKU-5-5	500	5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
83	Routine Áo Polo Excool	Sản phẩm Routine Áo Polo Excool thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	209000	SKU-3-2	500	3	2026-04-16 03:21:41.99	2026-04-16 12:29:15.088	1	\N	VND
84	Levents Áo Thun Oversize Graphic	Sản phẩm Levents Áo Thun Oversize Graphic thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-3-3	500	3	2026-04-16 03:21:41.99	2026-04-17 00:43:20.827	1	\N	VND
85	DirtyCoins Áo Polo Pique Pro	Sản phẩm DirtyCoins Áo Polo Pique Pro thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-3-4	500	3	2026-04-16 03:21:41.99	2026-04-17 00:46:40.134	1	\N	VND
86	SSStutter Áo Thun Basic Tee	Sản phẩm SSStutter Áo Thun Basic Tee thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-3-5	500	3	2026-04-16 03:21:41.99	2026-04-17 00:55:57.293	1	\N	VND
87	Outerity Áo Thun Local Brand	Sản phẩm Outerity Áo Thun Local Brand thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-3-6	500	3	2026-04-16 03:21:41.99	2026-04-17 00:57:57.454	1	\N	VND
107	Blue Exchange Quần Jean Raw Denim	Sản phẩm Blue Exchange Quần Jean Raw Denim thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	570000	SKU-5-6	500	5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
108	Canifa Quần Jean Denim Wash	Sản phẩm Canifa Quần Jean Denim Wash thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	590000	SKU-5-7	500	5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
109	Yame Quần Jean Jogger	Sản phẩm Yame Quần Jean Jogger thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	610000	SKU-5-8	500	5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
110	Ninmaxx Quần Jean Đen Basic	Sản phẩm Ninmaxx Quần Jean Đen Basic thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	630000	SKU-5-9	500	5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
111	Hades Quần Jean Local Brand	Sản phẩm Hades Quần Jean Local Brand thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	650000	SKU-5-10	500	5	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
112	Owen Quần Tây Slim Fit	Sản phẩm Owen Quần Tây Slim Fit thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	392000	SKU-6-1	500	6	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
113	Aristino Quần Kaki Chino Basic	Sản phẩm Aristino Quần Kaki Chino Basic thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	404000	SKU-6-2	500	6	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
114	Routine Quần Tây Âu Lịch Sự	Sản phẩm Routine Quần Tây Âu Lịch Sự thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	416000	SKU-6-3	500	6	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
115	SSStutter Quần Kaki Co Giãn 4 Chiều	Sản phẩm SSStutter Quần Kaki Co Giãn 4 Chiều thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	428000	SKU-6-4	500	6	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
116	Coolmate Quần Tây Không Nhăn	Sản phẩm Coolmate Quần Tây Không Nhăn thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	440000	SKU-6-5	500	6	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
117	Việt Tiến Quần Kaki Túi Hộp	Sản phẩm Việt Tiến Quần Kaki Túi Hộp thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	452000	SKU-6-6	500	6	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
118	Mattana Quần Tây Sidetab	Sản phẩm Mattana Quần Tây Sidetab thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	464000	SKU-6-7	500	6	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
119	An Phước Quần Kaki Form Regular	Sản phẩm An Phước Quần Kaki Form Regular thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	476000	SKU-6-8	500	6	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
120	Canifa Quần Tây Sợi Tre	Sản phẩm Canifa Quần Tây Sợi Tre thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	488000	SKU-6-9	500	6	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
121	The Blues Quần Kaki Công Sở	Sản phẩm The Blues Quần Kaki Công Sở thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	500000	SKU-6-10	500	6	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
122	Biti's Hunter Giày Sneaker Streetwear	Sản phẩm Biti's Hunter Giày Sneaker Streetwear thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	680000	SKU-7-1	500	7	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
123	Ananas Giày Slip-on Basic	Sản phẩm Ananas Giày Slip-on Basic thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	710000	SKU-7-2	500	7	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
124	RieNevan Giày Chạy Bộ Performance	Sản phẩm RieNevan Giày Chạy Bộ Performance thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	740000	SKU-7-3	500	7	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
125	MWC Giày Thể Thao Cao Cổ	Sản phẩm MWC Giày Thể Thao Cao Cổ thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	770000	SKU-7-4	500	7	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
126	Vento Giày Sandal Thể Thao	Sản phẩm Vento Giày Sandal Thể Thao thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	800000	SKU-7-5	500	7	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
127	Miti Giày Sneaker Da Lộn	Sản phẩm Miti Giày Sneaker Da Lộn thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	830000	SKU-7-6	500	7	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
128	Skechers Giày Tập Gym Êm Ái	Sản phẩm Skechers Giày Tập Gym Êm Ái thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	860000	SKU-7-7	500	7	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
129	Thượng Đình Giày Sneaker Vintage	Sản phẩm Thượng Đình Giày Sneaker Vintage thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	890000	SKU-7-8	500	7	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
130	Asia Sport Giày Thể Thao Nam Nữ	Sản phẩm Asia Sport Giày Thể Thao Nam Nữ thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	920000	SKU-7-9	500	7	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
131	Zoro Giày Sneaker Đế Cao	Sản phẩm Zoro Giày Sneaker Đế Cao thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	950000	SKU-7-10	500	7	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
132	LaForce Giày Oxford Da Bò	Sản phẩm LaForce Giày Oxford Da Bò thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	900000	SKU-8-1	500	8	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
133	Tâm Anh Giày Loafer Lịch Lãm	Sản phẩm Tâm Anh Giày Loafer Lịch Lãm thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	950000	SKU-8-2	500	8	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
134	Bitis Giày Derby Cổ Điển	Sản phẩm Bitis Giày Derby Cổ Điển thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	1000000	SKU-8-3	500	8	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
135	Leonardo Giày Mọi Da Thật	Sản phẩm Leonardo Giày Mọi Da Thật thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	1050000	SKU-8-4	500	8	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
136	Zapatos Giày Chelsea Boots	Sản phẩm Zapatos Giày Chelsea Boots thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	1100000	SKU-8-5	500	8	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
137	Smartmen Giày Tây Công Sở	Sản phẩm Smartmen Giày Tây Công Sở thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	1150000	SKU-8-6	500	8	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
138	Giày Việt Giày Monkstrap	Sản phẩm Giày Việt Giày Monkstrap thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	1200000	SKU-8-7	500	8	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
139	Ananas Giày Da Nam Cao Cấp	Sản phẩm Ananas Giày Da Nam Cao Cấp thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	1250000	SKU-8-8	500	8	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
140	Pierre Cardin Giày Sục Da	Sản phẩm Pierre Cardin Giày Sục Da thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	1300000	SKU-8-9	500	8	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
141	Oxford Giày Da Thủ Công	Sản phẩm Oxford Giày Da Thủ Công thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	1350000	SKU-8-10	500	8	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
142	MLB Nón Kết NY Yankees	Sản phẩm MLB Nón Kết NY Yankees thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	155000	SKU-9-1	500	9	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
143	Premi3r Nón Bucket Local Brand	Sản phẩm Premi3r Nón Bucket Local Brand thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	160000	SKU-9-2	500	9	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
144	Grimm DC Mũ Lưỡi Trai Basic	Sản phẩm Grimm DC Mũ Lưỡi Trai Basic thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	165000	SKU-9-3	500	9	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
145	DirtyCoins Nón Beanie Len	Sản phẩm DirtyCoins Nón Beanie Len thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	170000	SKU-9-4	500	9	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
146	Levents Nón Snapback Hip-hop	Sản phẩm Levents Nón Snapback Hip-hop thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	175000	SKU-9-5	500	9	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
147	Hades Mũ Beret Thời Trang	Sản phẩm Hades Mũ Beret Thời Trang thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	180000	SKU-9-6	500	9	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
148	Degrey Nón Kết Thêu Logo	Sản phẩm Degrey Nón Kết Thêu Logo thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	185000	SKU-9-7	500	9	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
149	Coolmate Nón Tai Bèo Chống Nắng	Sản phẩm Coolmate Nón Tai Bèo Chống Nắng thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	190000	SKU-9-8	500	9	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
150	Nón Sơn Nón Kết Kaki	Sản phẩm Nón Sơn Nón Kết Kaki thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	195000	SKU-9-9	500	9	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
151	Yame Nón Snapback Classic	Sản phẩm Yame Nón Snapback Classic thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	200000	SKU-9-10	500	9	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
152	Leonardo Thắt Lưng Da Miếng	Sản phẩm Leonardo Thắt Lưng Da Miếng thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	119000	SKU-10-1	500	10	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
153	KaLong Ví Da Bò Saffiano	Sản phẩm KaLong Ví Da Bò Saffiano thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	139000	SKU-10-2	500	10	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
154	Midori Tất Cổ Cao Cotton	Sản phẩm Midori Tất Cổ Cao Cotton thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	159000	SKU-10-3	500	10	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
155	Coolmate Túi Đeo Chéo Canvas	Sản phẩm Coolmate Túi Đeo Chéo Canvas thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	179000	SKU-10-4	500	10	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
156	Levents Ví Đựng Thẻ Card Holder	Sản phẩm Levents Ví Đựng Thẻ Card Holder thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	199000	SKU-10-5	500	10	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
157	DirtyCoins Thắt Lưng Mặt Khóa Kim	Sản phẩm DirtyCoins Thắt Lưng Mặt Khóa Kim thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	219000	SKU-10-6	500	10	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
158	Routine Tất Thể Thao Khử Mùi	Sản phẩm Routine Tất Thể Thao Khử Mùi thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	239000	SKU-10-7	500	10	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
159	Ananas Túi Tote Thời Trang	Sản phẩm Ananas Túi Tote Thời Trang thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	259000	SKU-10-8	500	10	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
160	Zoro Ví Dài Unisex	Sản phẩm Zoro Ví Dài Unisex thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	279000	SKU-10-9	500	10	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
161	Owen Cà Vạt Lụa Cao Cấp	Sản phẩm Owen Cà Vạt Lụa Cao Cấp thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	299000	SKU-10-10	500	10	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
162	DirtyCoins Áo Hoodie Big Logo	Sản phẩm DirtyCoins Áo Hoodie Big Logo thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	475000	SKU-11-1	500	11	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
163	Levents Áo Khoác Bomber Streetwear	Sản phẩm Levents Áo Khoác Bomber Streetwear thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	500000	SKU-11-2	500	11	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
164	Hades Áo Varsity Jacket	Sản phẩm Hades Áo Varsity Jacket thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	525000	SKU-11-3	500	11	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
165	Degrey Áo Khoác Gió Chống Nước	Sản phẩm Degrey Áo Khoác Gió Chống Nước thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	550000	SKU-11-4	500	11	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
166	5theway Áo Hoodie Oversize	Sản phẩm 5theway Áo Hoodie Oversize thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	575000	SKU-11-5	500	11	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
167	Clownz Áo Khoác Kaki Form Rộng	Sản phẩm Clownz Áo Khoác Kaki Form Rộng thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	600000	SKU-11-6	500	11	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
168	Outerity Áo Sweater Nỉ Bông	Sản phẩm Outerity Áo Sweater Nỉ Bông thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	625000	SKU-11-7	500	11	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
169	Routine Áo Khoác Denim	Sản phẩm Routine Áo Khoác Denim thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	650000	SKU-11-8	500	11	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
170	Coolmate Áo Hoodie Phối Màu	Sản phẩm Coolmate Áo Hoodie Phối Màu thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	675000	SKU-11-9	500	11	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
171	Canifa Áo Khoác Hoodie Zipper	Sản phẩm Canifa Áo Khoác Hoodie Zipper thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	700000	SKU-11-10	500	11	2026-04-16 03:21:41.99	2026-04-16 03:21:41.99	1	\N	VND
82	Coolmate Áo Thun Cotton Compact	Sản phẩm Coolmate Áo Thun Cotton Compact thuộc bộ sưu tập mới nhất. Chất liệu cao cấp, form dáng chuẩn, phù hợp mặc hàng ngày hoặc đi chơi.	0	SKU-3-1	500	3	2026-04-16 03:21:41.99	2026-04-16 11:50:52.05	1	\N	VND
\.


--
-- TOC entry 3887 (class 0 OID 72829)
-- Dependencies: 251
-- Data for Name: Requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Requests" (id, "orderId", description, status, "createdAt", "updatedAt", "userId", "processByStaffId", subject) FROM stdin;
\.


--
-- TOC entry 3895 (class 0 OID 73495)
-- Dependencies: 259
-- Data for Name: ReturnRequests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReturnRequests" (id, "requestId", "createdAt", "updatedAt", "bankAccountName", "bankAccountNumber", "bankName") FROM stdin;
\.


--
-- TOC entry 3867 (class 0 OID 72733)
-- Dependencies: 231
-- Data for Name: Reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Reviews" (id, "productId", "productVariantId", rating, comment, "createdAt", "updatedAt", "userId") FROM stdin;
\.


--
-- TOC entry 3899 (class 0 OID 73734)
-- Dependencies: 263
-- Data for Name: RoomChat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RoomChat" (id, name, description, "isPrivate", "createdAt", "updatedAt") FROM stdin;
1	support-12	Phuong Vo Mai	f	2026-04-16 10:52:51.353	2026-04-16 10:52:51.353
\.


--
-- TOC entry 3891 (class 0 OID 73325)
-- Dependencies: 255
-- Data for Name: ShipmentItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShipmentItems" (id, "shipmentId", "orderItemId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3875 (class 0 OID 72773)
-- Dependencies: 239
-- Data for Name: Shipments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Shipments" (id, "orderId", "estimatedDelivery", "deliveredAt", "estimatedShipDate", "shippedAt", carrier, "trackingNumber", status, "createdAt", "updatedAt", "processByStaffId", "ghnOrderCode", description, "ghnPickShiftId") FROM stdin;
\.


--
-- TOC entry 3859 (class 0 OID 72692)
-- Dependencies: 223
-- Data for Name: SizeProfiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SizeProfiles" (id, "heightCm", "weightKg", "chestCm", "hipCm", "sleeveLengthCm", "inseamCm", "shoulderLengthCm", "bodyType", description, "createdAt", "updatedAt", "userId") FROM stdin;
\.


--
-- TOC entry 3855 (class 0 OID 72574)
-- Dependencies: 219
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
13	2026-04-16 11:43:46.703	2026-04-17 01:17:46.796	vomaiphuonghhvt@gmail.com	1234567890	Phuong	Vo Mai	ADMIN	$2b$10$V.McqY1skT1ygUli3alEwO2UnxnMxulldvJaaNd0nC/z4Upeh.ABa	VoMaiPhuong465465	f93f6558-27e9-4cc6-b443-029a28b8eb99	2026-04-16 11:48:46.705	t	OTHER	0	\N	\N	\N
\.


--
-- TOC entry 3900 (class 0 OID 73744)
-- Dependencies: 264
-- Data for Name: UserRoomChat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserRoomChat" ("userId", "roomChatId", "joinedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3885 (class 0 OID 72820)
-- Dependencies: 249
-- Data for Name: UserVouchers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserVouchers" (id, "voucherId", "useVoucherAt", "saveVoucherAt", "voucherStatus", "userId", "createdAt", "updatedAt", "orderId") FROM stdin;
1	19	\N	2026-04-16 03:30:13.047	SAVED	3	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	\N
2	19	\N	2026-04-16 03:30:13.047	SAVED	3	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	\N
3	16	\N	2026-04-16 03:30:13.047	SAVED	3	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	\N
4	19	\N	2026-04-16 03:30:13.047	SAVED	4	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	\N
5	13	\N	2026-04-16 03:30:13.047	SAVED	4	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	\N
6	19	\N	2026-04-16 03:30:13.047	SAVED	4	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	\N
7	11	\N	2026-04-16 03:30:13.047	SAVED	5	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	\N
8	11	\N	2026-04-16 03:30:13.047	SAVED	6	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	\N
9	10	\N	2026-04-16 03:30:13.047	SAVED	6	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	\N
10	10	\N	2026-04-16 03:30:13.047	SAVED	7	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	\N
11	12	\N	2026-04-16 03:30:13.047	SAVED	8	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	\N
12	15	\N	2026-04-16 03:30:13.047	SAVED	8	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	\N
13	10	\N	2026-04-16 03:30:13.047	SAVED	8	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	\N
14	11	\N	2026-04-16 03:30:13.047	SAVED	9	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	\N
15	20	\N	2026-04-16 03:30:13.047	SAVED	9	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	\N
16	16	\N	2026-04-16 03:30:13.047	SAVED	9	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	\N
17	19	\N	2026-04-16 03:30:13.047	SAVED	10	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	\N
18	13	\N	2026-04-16 03:30:13.047	SAVED	10	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	\N
19	12	\N	2026-04-16 03:30:13.047	SAVED	10	2026-04-16 03:30:13.047	2026-04-16 03:30:13.047	\N
\.


--
-- TOC entry 3883 (class 0 OID 72807)
-- Dependencies: 247
-- Data for Name: Vouchers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Vouchers" (id, code, description, "discountType", "discountValue", "validFrom", "validTo", "usageLimit", "timesUsed", "isActive", "createdAt", "createdBy", "updatedAt", "isOverUsageLimit") FROM stdin;
1	LUNAR2024	Mừng Tết Giáp Thìn 2024	FIXED_AMOUNT	50000	2024-01-01 00:00:00	2024-02-15 00:00:00	1000	1000	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
2	WINTER23	Xả kho mùa đông 2023	PERCENTAGE	20	2023-11-01 00:00:00	2023-12-31 00:00:00	500	500	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
3	BLACKFRIDAY	Siêu sale Black Friday	PERCENTAGE	50	2023-11-20 00:00:00	2023-11-30 00:00:00	2000	2000	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
4	OPENING	Chào mừng khai trương shop	FIXED_AMOUNT	100000	2023-10-01 00:00:00	2023-10-31 00:00:00	100	100	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
5	FREESHIP0D	Miễn phí vận chuyển đơn 0đ tháng 1	FIXED_AMOUNT	15000	2024-01-01 00:00:00	2024-01-31 00:00:00	5000	5000	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
6	VALENTINE24	Lễ tình nhân ngọt ngào	PERCENTAGE	14	2024-02-10 00:00:00	2024-02-16 00:00:00	214	214	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
7	WOMENDAY	Quốc tế phụ nữ 8/3	FIXED_AMOUNT	30000	2024-03-01 00:00:00	2024-03-10 00:00:00	830	830	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
8	BIRTHDAY_APR	Mừng sinh nhật shop tháng 4	PERCENTAGE	25	2024-04-01 00:00:00	2024-04-10 00:00:00	400	400	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
9	FLASHSALE1	Flash Sale chớp nhoáng	FIXED_AMOUNT	99000	2024-04-12 00:00:00	2024-04-13 00:00:00	50	50	t	2026-04-16 02:58:30.736	1	2026-04-16 02:58:30.736	f
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
\.


--
-- TOC entry 3853 (class 0 OID 72558)
-- Dependencies: 217
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ccba95eb-dccc-43f6-891d-5b91fa6b3141	bef73217cf4f9b48ed61cbdc348f256c7ab92789bed0f35315d116aa0ce6349c	2026-04-16 02:43:26.020209+00	20260129034441_add_new_fields_for_order_items	\N	\N	2026-04-16 02:43:26.006037+00	1
b2a3b9fe-d6e3-4938-8e78-7ad3a0eb57d1	797b9057f301e3381b61e9f32464a4554828b4888bcf8ca4dc4093799e79c7a7	2026-04-16 02:43:25.267448+00	20250927122948_first_create_user_model_and_role_enum	\N	\N	2026-04-16 02:43:25.242042+00	1
9ec32a84-cb25-437d-8902-eb8a501a68de	27390a73fe3c81127526e792c158e117f97757b0202915e5772e6eac7cef7843	2026-04-16 02:43:25.664317+00	20251120130041_add_new_relation_for_voucher_there_are_voucher_for_product_special_product_variant_and_category	\N	\N	2026-04-16 02:43:25.641456+00	1
23ef13f1-4a20-4161-aad6-b10157959309	7f07e4c2171fb49ba4cae042afb2f537993692d95c0fa525521dc726c5119283	2026-04-16 02:43:25.293468+00	20250927152918_update_user_prisma_schema	\N	\N	2026-04-16 02:43:25.274846+00	1
a1eab23a-b958-4f14-8466-c5f8833f56e2	82c7dee98c9019a3677be3572994d934e6b674ded1640fc4d57e4de0cbef615a	2026-04-16 02:43:25.32198+00	20250928072459_update_password_field_type_for_user_account	\N	\N	2026-04-16 02:43:25.300153+00	1
eb7b5e9a-f63e-41be-bac6-2cee5fca8d12	19607241ead8386da9080337693ed2717d7df08b0da7a25ccf8721202d84dec2	2026-04-16 02:43:25.846594+00	20251204090717_update_relation_request_have_many_media	\N	\N	2026-04-16 02:43:25.827395+00	1
4967ede7-fb43-460e-9cc9-6679a53f8914	63befaade6400e7f26a2703b8d1c7b04ccec4000a1b37f273e6afe1573ed2435	2026-04-16 02:43:25.344325+00	20251002143912_update_unique_constrain_for_email_field_in_user_model	\N	\N	2026-04-16 02:43:25.327407+00	1
5ae1de84-e89d-41a5-91c8-631e38d3da3c	915d2a3db2a36796510c98db3d7602a5edc3e157afa326d3e9dce261fb976169	2026-04-16 02:43:25.690241+00	20251120140013_add_new_shop_office_model_insert_new_field_for_relation_from_shop_office_to_staff_address_product_and_category	\N	\N	2026-04-16 02:43:25.669586+00	1
19af114f-5505-4abe-b7de-3e39a28a8c4e	d765fb4e4f2cf66655ad1165492348d85c9aa04df575830da1ceb06338dbc7fd	2026-04-16 02:43:25.36987+00	20251003114347_update_option_field_in_user_model_in_prisma_schema	\N	\N	2026-04-16 02:43:25.349359+00	1
c2109dad-8370-43e2-8221-d792aa19384f	0cb0c830a9c4ee2757cd0ac1059c1832827ca3f2554016c0b1226cccfb58a7e5	2026-04-16 02:43:25.466922+00	20251115111632_define_all_needed_model_version_1	\N	\N	2026-04-16 02:43:25.375597+00	1
65d1e69b-27df-4051-9cfd-88a163547437	973226f7820fa9abe10a092714421b8d535b458a51a3c7c97b1cb6a1d3b9c117	2026-04-16 02:43:25.505817+00	20251116130216_merge_staff_and_customer_model_into_user_model_and_delete_redundant_staff_and_customer_model	\N	\N	2026-04-16 02:43:25.475361+00	1
1c6f373c-7d70-4098-a2fe-9d1fc8d57b28	034c7eb721ecae92a1ec0323f1f4cb84b893d750d708cf51f65c5c39083549bf	2026-04-16 02:43:25.715218+00	20251120141842_update_add_new_shop_name_field_in_shop_office_model	\N	\N	2026-04-16 02:43:25.696775+00	1
b5058bbf-8d77-4b3d-a0ef-79d41aee5028	23dc9bb564fe31873d4675b5434c4fb79cba28f2a02077ee2a13077bee7349eb	2026-04-16 02:43:25.536526+00	20251117093736_add_new_relation_in_user_model_after_merge_customer_and_staff_model_these_relation_are_on_manage_shop_for_staff_admin	\N	\N	2026-04-16 02:43:25.512398+00	1
76826098-19f2-45e9-9d5f-3302831cbf87	276a5aa1a52dfdd1e96c1130ab3d46650b40ab69df70de5f989da16c7df24c78	2026-04-16 02:43:25.564548+00	20251117120232_change_data_type_of_media_type_field_in_media_model_from_string_to_enum_media_type	\N	\N	2026-04-16 02:43:25.542517+00	1
552cd3a2-b634-4118-a948-878c91cdaa03	48961dc07fadfbc573e172cd9e2c5428233eaaf0c7f8a775a7db399cd58d1e3d	2026-04-16 02:43:25.975741+00	20260128085832_add_new_color_table_and_reference_color_to_product_variants_is_optional_and_update_process_by_staff_fields_in_orders_shipments_requests_to_is_optional	\N	\N	2026-04-16 02:43:25.952791+00	1
a044cf33-6c4b-4416-892e-59e35b1443bb	190044508dee24057f6af9254033c05c9547e27615c675de3c6fae14f0185207	2026-04-16 02:43:25.589227+00	20251118035314_update_size_profiles_prisma_model	\N	\N	2026-04-16 02:43:25.570553+00	1
85113ae6-87ed-4d5d-838b-806a8e01a27b	6b9f0085b4276233d3c74a15291a281cc69594f70a97698d488c13b79e0ab009	2026-04-16 02:43:25.741314+00	20251120153917_delete_dont_need_unique_contraint_in_model	\N	\N	2026-04-16 02:43:25.721991+00	1
8c596b48-66d0-437a-bbd5-159668510f44	1cb1268c945ea47f08bbd86596212dc580b198ee9bfd164c674037478548b253	2026-04-16 02:43:25.633409+00	20251118062409_update_ondelete_and_onupdate_in_relation_in_prisma_model	\N	\N	2026-04-16 02:43:25.595716+00	1
440bca09-9821-4a18-b363-65a98d52e178	77c15dbe8eeb9a8dd47bb555a0d2499db97a09281377a47992ed66449739290a	2026-04-16 02:43:25.870369+00	20251205094939_add_google_id_field_in_user_model	\N	\N	2026-04-16 02:43:25.852393+00	1
93f547a3-940c-47bd-bbd2-96569539f159	e29a67bdc570e1877b5d9c71197ca68458c441c8cad867850b32525c5db53fc0	2026-04-16 02:43:25.76827+00	20251201014014_update_is_shop_logo_and_is_shop_banner_fields_in_media_model	\N	\N	2026-04-16 02:43:25.748484+00	1
627cba4a-c89d-4cff-a4cc-bcf413ef05c8	1fe8d8f93782e67f921141bb438eb32875dcbe8373a59fd8db2b1ac50208ed29	2026-04-16 02:43:25.794547+00	20251201021219_update_add_is_category_file_field_in_media_model	\N	\N	2026-04-16 02:43:25.775883+00	1
450ba184-148a-4d9e-bb65-a0293b84fb83	353195bbd51081032c934cebc83e644a88c02d9840fa1beaf1d2710a7f0bdeea	2026-04-16 02:43:25.820122+00	20251201110210_update_add_is_avatar_file_field_in_media_model	\N	\N	2026-04-16 02:43:25.800616+00	1
042453af-c36e-47e1-a1b1-18f72ea3027e	c8682091abcebf526c48f71a306d680ed1524f156c628c2da5c82a707715259d	2026-04-16 02:43:25.8978+00	20251205104942_delete_field_google_id_on_user_model_prisma	\N	\N	2026-04-16 02:43:25.876289+00	1
681a6814-62cf-4ad6-a7ce-c2bc5745994b	77c15dbe8eeb9a8dd47bb555a0d2499db97a09281377a47992ed66449739290a	2026-04-16 02:43:25.924749+00	20251205111701_add_google_id_field_in_user_model_prisma	\N	\N	2026-04-16 02:43:25.904672+00	1
c2689ac8-7afd-415c-b10f-b5324c087478	0808530f9722831e12959ddfcb34b55f7d663aa3f10e34da92ab4147e93d54e5	2026-04-16 02:43:25.999014+00	20260129033230_add_new_fields_for_product_variants_and_add_default_db_type_for_fields	\N	\N	2026-04-16 02:43:25.980821+00	1
ba915ff5-9a27-415b-b1a0-43914981d7e4	520a8cf6d8d14ea1d8d4b6340761ba37b5b7e8ebb65e3620784bd8cc462afa35	2026-04-16 02:43:25.946346+00	20260112025438_delete_is_admin_column_in_user_table_because_role_admin_operator_user_is_enough	\N	\N	2026-04-16 02:43:25.929733+00	1
ec468886-31a2-4cf3-9489-f60c1942b988	3ba33a90694e99c45a6be07d6ff4c69c585681183e81f67a343d456801e53bda	2026-04-16 02:43:26.092961+00	20260129104751_add_new_bank_account_number_and_bank_name_fields_for_return_requests_table	\N	\N	2026-04-16 02:43:26.074206+00	1
fcab60e6-ed2c-4298-a31a-9707f41863f1	1e9d56bb09f8292fe9d36494c73d7b6b9fd60508fd77c9dfcf9612aaa0bb4672	2026-04-16 02:43:26.044869+00	20260129042415_update	\N	\N	2026-04-16 02:43:26.025413+00	1
1fefa378-31a2-45a3-922c-3d8487f372d3	0e8e08e90304e8534ca9f8cbb5f1d9f42d993f7eb1392bcec3e47d2fdb463bfe	2026-04-16 02:43:26.069025+00	20260129094129_add_new_currency_unit_fields	\N	\N	2026-04-16 02:43:26.049365+00	1
db2fd776-7a96-4312-8b09-e5d49cbba950	39c18a1c8cd365c8f823eb983ced1805eef481f70cf699f3dc17c71ae4b86092	2026-04-16 02:43:26.111439+00	20260129112418_update_bank_account_number_and_bank_name_fields_for_return_requests_table	\N	\N	2026-04-16 02:43:26.097322+00	1
1f06568e-6d18-4cef-9b66-fd81086d4bac	4954a93a6865b128734f0c0c229df8f11ea80aba75ab10bcaf4868c17dc43b33	2026-04-16 02:43:26.14863+00	20260202075018_update_index_for_table_in_db	\N	\N	2026-04-16 02:43:26.115452+00	1
da6e7303-e290-41a1-a4f9-b05880888020	f26ce3be06bc09d9259a205c00ec47e4eea896a7f247fa0c6d9ccb3eab27688d	2026-04-16 02:43:26.165693+00	20260202075207_update_update_at_fields_delete_default_now	\N	\N	2026-04-16 02:43:26.153014+00	1
f9b01886-b218-4f95-9a9d-26962b6b2313	0b8146efe9bb0d4a17884edcd0b2149307f0f5660a31c7ce77b7105dd711bc6a	2026-04-16 02:43:26.191801+00	20260210042607_update_model_for_connect_ghn_shipment	\N	\N	2026-04-16 02:43:26.170848+00	1
254b56bb-9ee0-4ed6-b9e3-1eb747ce3f47	51c230c2f76ea3251a4e10c31f3db4c5b17a12eda92e9c3a11487bfd2c269f57	2026-04-16 02:43:26.631591+00	20260329102905_add_package_checksums_id_in_orders_model	\N	\N	2026-04-16 02:43:26.614207+00	1
e3b8e9cc-125e-42fb-a055-f003a3d2cf7e	b2bd1e943c2b91cc873256baf431d071d5ede98268b9e8c7f3d4c674f4a5f802	2026-04-16 02:43:26.214604+00	20260214103915_add_description_field_for_orders_shipments_tables	\N	\N	2026-04-16 02:43:26.196944+00	1
8b3a271e-d97b-47f6-a87c-f22f30af5df8	0114b7ac9d99b3de63dbc4590794aecd254f8c1616abbf10efb419832776c903	2026-04-16 02:43:26.488751+00	20260326022110_add_ghn_shipment_jobs_model	\N	\N	2026-04-16 02:43:26.469221+00	1
5855483c-00d3-4893-b998-3c3c72c2d67c	2f68d0140652ea42e90dbbc44fc3b58c5edcb1dbec0e167e12d4d0f5bf569082	2026-04-16 02:43:26.237991+00	20260216072203_add_ghn_shop_province_id_ghn_shop_district_id_ghn_shop_ward_code_fields	\N	\N	2026-04-16 02:43:26.221345+00	1
09f771b7-4b45-4b1c-aa4c-3815ca0cf362	df2ede48ac686685cb1ab1659176467ee60a76b6fd94b1018d80022d0eacce3b	2026-04-16 02:43:26.257037+00	20260306082320_add_media_relation_for_product_table	\N	\N	2026-04-16 02:43:26.242652+00	1
dc9e1ce1-1094-4f17-9af0-d516ae320e6f	7648be3fc8e3c1ca42231ec1de77536f5f9afc5ca6dd33e1cb64c29a1bcfb6dd	2026-04-16 02:43:26.277742+00	20260311023541_update_the_order_status_shipment_status_payment_status_enums_version_1_0	\N	\N	2026-04-16 02:43:26.262969+00	1
b4d2006b-8c96-401e-8896-0d9c30607989	d9a8550b14af5ab976fe187b26ed33b783d5f354cecb90eec99e6e00778785fe	2026-04-16 02:43:26.510049+00	20260326024644_delete_ghn_shipment_jobs_model	\N	\N	2026-04-16 02:43:26.493674+00	1
f4280cf8-cbec-428f-a882-1e9686b70ac6	154b6bff846fe5b2c57f6f6355090e0e579ec1b01980be5b5db598bac10f4267	2026-04-16 02:43:26.297453+00	20260311023608_update_the_order_status_shipment_status_payment_status_enums_version_1_1	\N	\N	2026-04-16 02:43:26.282165+00	1
c7e2fae3-c752-4276-879d-fe6a3cf0df5f	f9054e5b1f1c3d1794af9b074c268a6c72b5ca8fbb251e0389fd3702c5a3c156	2026-04-16 02:43:26.331546+00	20260311024120_update_the_order_status_shipment_status_payment_status_enums_version_1_2	\N	\N	2026-04-16 02:43:26.302034+00	1
0fead126-90ca-4779-8d83-1a172b10f67b	6ec3cfa468ee7b00aaa0fa6e21e77d70c2f3ceb00dcf5b6f7ce15f1c597caeb2	2026-04-16 02:43:26.358138+00	20260311082900_delete_shop_office_entity_and_shop_id_field_in_prisma_schema	\N	\N	2026-04-16 02:43:26.337339+00	1
f05881bc-9f4e-4544-8b8f-f4cfee936527	72f9ff909527c6637e259ec1d6a08ee9166199c51a3ec016c6c42e76cdbd80e8	2026-04-16 02:43:26.528885+00	20260326025345_delete_ghn_shipment_job_status_enum	\N	\N	2026-04-16 02:43:26.514459+00	1
2335342f-9278-41c7-9947-2edeea1d7b85	bdcc675b5ca78ff81655985ac0adcd6e30cb438a54384a3495c72575dd9df37e	2026-04-16 02:43:26.38282+00	20260313154850_add_package_checksums_model	\N	\N	2026-04-16 02:43:26.36252+00	1
df1459ad-6f9b-479e-ac73-46b80148708b	5f5ee1c5a6320a08843e6af9fa3d16b591cf2aef0c7e29a8be2a850a495b4f14	2026-04-16 02:43:26.407879+00	20260314033636_add_expired_at_and_is_used_fields_in_package_checksum_model	\N	\N	2026-04-16 02:43:26.389735+00	1
9c8ab11f-d093-4b21-bd55-30e653099e6e	45fefc33459c6d2b493777c2814575595fb8955b605a138d75f7471c04b0c527	2026-04-16 02:43:26.653691+00	20260329151530_add_cancelled_status_for_shipment_status_payment_status_enums	\N	\N	2026-04-16 02:43:26.636862+00	1
997446e7-7e35-4758-a72c-5f0d080c2f87	837879790fe4f910669842fcf8a6db6d14c6e74612c22d5fd10c382d4ea3ff1e	2026-04-16 02:43:26.435641+00	20260314043442_add_user_id_field_in_package_checksum_model	\N	\N	2026-04-16 02:43:26.414818+00	1
4f2d4542-d144-48a9-b3ac-88c857b3029e	e90f731f7596ae87ef08fc04f0cba41ac397d3d06f01cd3e1b6e47e328cde4cd	2026-04-16 02:43:26.548422+00	20260326113204_add_test_model_for_test_run_again_loss_migrate	\N	\N	2026-04-16 02:43:26.533078+00	1
d193d551-7de1-46fa-95ae-3e08d0cc3c19	bbfd6246c38279222003a26e8985d2ae2c7081e15c703bce6048dd0815bd8235	2026-04-16 02:43:26.462766+00	20260314091915_add_is_over_usage_limit_field_in_vouchers_model	\N	\N	2026-04-16 02:43:26.443574+00	1
72d45306-5954-49f8-b137-d12f5aba0d40	4391d84660445052b510c9f90130ac3e14c973a6d2f7382158e233f3a647893c	2026-04-16 02:43:26.56897+00	20260326113505_delete_test_model_for_test_run_again_loss_migrate	\N	\N	2026-04-16 02:43:26.55253+00	1
aed7b099-ae45-4ca3-826d-2ed510bb63e8	fe68c3deada655440fba97cfa81bf20e35246e9dd439a71a5c661838af46c94c	2026-04-16 02:43:26.748382+00	20260330100342_delete_payment_methods_are_not_cod_and_vnpay_in_payment_method_enum	\N	\N	2026-04-16 02:43:26.724297+00	1
52f6cf49-be5b-45a3-bdbe-d963c02bcc6b	fc6e07dbc4be1b69a8e2f908334ade873242d6a427f320cf7c194d1ba0e8e03c	2026-04-16 02:43:26.588766+00	20260329070700_add_is_order_address_field_in_address_model	\N	\N	2026-04-16 02:43:26.574728+00	1
506caa53-de0e-45ae-901e-3d2939254609	88be99c18ca0bc36e6e3297ffd6622a96a92fa4f6d903e4e9603defa20bb6317	2026-04-16 02:43:26.677229+00	20260330094657_delete_return_requests_model_and_update_request_type_in_requests_model	\N	\N	2026-04-16 02:43:26.659643+00	1
ad841630-3759-4b2c-b873-17b9045f9176	9871e2686538d850e3e2c5431c052f8101358887727fb42146e7614924282f0e	2026-04-16 02:43:26.607651+00	20260329075345_add_applied_voucher_for_order_items_and_add_applied_user_voucher_for_orders	\N	\N	2026-04-16 02:43:26.593046+00	1
6b06682e-6516-4766-8232-bf1b7d7ff577	515ef4f070e321a88652dcc1a7b49ff234d4c5b17b23e691485b4e2ec964ec58	2026-04-16 02:43:26.856608+00	20260401074018_change_price_format_from_float_db_double_pricision_to_decimal_db_decimal_15_2_and_add_new_vnp_expire_date_to_payments_model	\N	\N	2026-04-16 02:43:26.802155+00	1
ca16b6f4-9091-4a7b-82e7-b31aaab55fcf	5303324e73b017df15b1828e1a23e2be62526accd8561b23811f37a0f3a95a5e	2026-04-16 02:43:26.698577+00	20260330095141_rollback_after_delete_return_requests_model_and_update_request_type_in_requests_model	\N	\N	2026-04-16 02:43:26.681359+00	1
a7abbec0-bbcf-471b-b558-92df0868286e	c08a6c3e7a73ed73848bebcb248b92fd0cf1454c9bb51932c35745e359fcf499	2026-04-16 02:43:26.778551+00	20260330101525_add_request_type_enum	\N	\N	2026-04-16 02:43:26.756796+00	1
c4e68b33-857e-4467-8f50-9e68e39d1e1b	6fc531915a06b15148f46a16f66dd2bc0523e5674ca4bf093146f53a312b1e17	2026-04-16 02:43:26.718985+00	20260330095623_delete_bank_name_and_bank_account_number_in_return_requests_model	\N	\N	2026-04-16 02:43:26.70343+00	1
b730a54a-e5a2-4029-8a8b-490a3487167e	a492f46fbd52f1da6a7f9baf3f6870a8f98f641e8b02894bee639e5d5ceeb0e8	2026-04-16 02:43:26.797079+00	20260331153112_add_vnp_create_date_in_payments_model	\N	\N	2026-04-16 02:43:26.782852+00	1
e0da7157-7195-4291-ba12-ef88f9e1438f	7576d7b89cef25aa067a24a0c14ba790c78c093e31cb5fa36af6388f4fb5ff5b	2026-04-16 02:43:26.929816+00	20260402040412_add_ghn_pick_shift_model_and_add_new_ghn_pick_shift_id_in_shipments_model	\N	\N	2026-04-16 02:43:26.912778+00	1
99639c57-dd5e-44e5-be4a-eb3a90feacd0	dadac58fb0e0f841a6f469234fcc1c12f36c1941fbc6bd36edf05aea1d32ef6b	2026-04-16 02:43:26.907372+00	20260401075136_rollback_change_price_format	\N	\N	2026-04-16 02:43:26.863092+00	1
0f902b2d-52da-456c-8f03-e774a1eedee7	a88ae962de25849ea2a14184b3b764ab14f47c5483d0baa79e84d761374edaa9	2026-04-16 02:43:26.953024+00	20260402142904_add_bank_name_enum	\N	\N	2026-04-16 02:43:26.934291+00	1
f77202b8-7649-4534-b07e-34e51ec396f2	f173fedddb4c748687e8a8a8e2f18c11c76e761f26e296ff4c56c8e0008a85fc	2026-04-16 02:43:26.976719+00	20260402143341_update_bank_fields_in_return_requests_model	\N	\N	2026-04-16 02:43:26.960472+00	1
ca786542-09a4-41cc-9b0f-ecb3c557d10b	91f44bba813804c263566709c8c73e687e7907e68f72a4e9a01a0a9c5731e558	2026-04-16 02:43:26.995562+00	20260403160320_update_order_status_enum	\N	\N	2026-04-16 02:43:26.980994+00	1
443c0149-0253-4a65-8978-93d9580faa30	10cb81a955dd64f1f1d45531fee11b1a07fad59cf8f9c813fc0c752d0c8a31dc	2026-04-16 02:43:27.01493+00	20260405104546_update_is_new_product_variant_and_sold_quantity_fields_in_product_variants_model	\N	\N	2026-04-16 02:43:26.999935+00	1
13fbdca7-3854-454c-90c9-8e84cdbd2d1e	139394d33853fb2cf0116c2f67a41ad5a04d90b434a76c633a51b6d773c9f1e1	2026-04-16 02:43:27.096787+00	20260408132826_add_new_message_room_chat_user_room_chat_models_for_chat_module	\N	\N	2026-04-16 02:43:27.019544+00	1
65712ad0-f8be-4548-8467-f6b75f0c6e52	2d97ef4554f8b6b940ced994ad67498922b7d8bebfc7992710eb2ad7648ac945	2026-04-16 02:43:27.137259+00	20260412122532_add_notification_model	\N	\N	2026-04-16 02:43:27.110291+00	1
5b663aa1-1b42-4235-b530-6c12eac5a36e	5a6c97bcccaf88f5ce29fd6710fc145e408fd309ebee5806b18485942356e324	2026-04-16 02:43:27.163119+00	20260413025205_fix_separate_notification_models	\N	\N	2026-04-16 02:43:27.142883+00	1
62f5d873-da9e-47b4-a1df-0c8eda0c25a9	7ac437bfc4c53026cbd81f287e0aea0d73f5c254c55134ce74c1dfe451f83942	2026-04-16 02:43:27.186244+00	20260413080410_fix_union_all_notification_models_into_one_model	\N	\N	2026-04-16 02:43:27.167319+00	1
777cf029-5213-4d2a-8d94-5f511f29aa2f	03837219b8e0bb809ad49a996aa48aeccdda4b1eacfc7340df180f63ebf46bad	2026-04-16 02:43:27.204364+00	20260413082417_fix_notification_model	\N	\N	2026-04-16 02:43:27.191048+00	1
\.


--
-- TOC entry 3937 (class 0 OID 0)
-- Dependencies: 220
-- Name: Address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Address_id_seq"', 10, true);


--
-- TOC entry 3938 (class 0 OID 0)
-- Dependencies: 244
-- Name: CartItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CartItems_id_seq"', 25, true);


--
-- TOC entry 3939 (class 0 OID 0)
-- Dependencies: 242
-- Name: Cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Cart_id_seq"', 8, true);


--
-- TOC entry 3940 (class 0 OID 0)
-- Dependencies: 226
-- Name: Category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Category_id_seq"', 12, true);


--
-- TOC entry 3941 (class 0 OID 0)
-- Dependencies: 252
-- Name: Color_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Color_id_seq"', 10, true);


--
-- TOC entry 3942 (class 0 OID 0)
-- Dependencies: 260
-- Name: GhnPickShift_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."GhnPickShift_id_seq"', 1, false);


--
-- TOC entry 3943 (class 0 OID 0)
-- Dependencies: 232
-- Name: Media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Media_id_seq"', 137, true);


--
-- TOC entry 3944 (class 0 OID 0)
-- Dependencies: 265
-- Name: Message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Message_id_seq"', 1, true);


--
-- TOC entry 3945 (class 0 OID 0)
-- Dependencies: 267
-- Name: Notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Notification_id_seq"', 1, false);


--
-- TOC entry 3946 (class 0 OID 0)
-- Dependencies: 236
-- Name: OrderItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OrderItems_id_seq"', 1, false);


--
-- TOC entry 3947 (class 0 OID 0)
-- Dependencies: 234
-- Name: Orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Orders_id_seq"', 1, false);


--
-- TOC entry 3948 (class 0 OID 0)
-- Dependencies: 256
-- Name: PackageChecksums_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PackageChecksums_id_seq"', 1, false);


--
-- TOC entry 3949 (class 0 OID 0)
-- Dependencies: 240
-- Name: Payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Payments_id_seq"', 1, false);


--
-- TOC entry 3950 (class 0 OID 0)
-- Dependencies: 228
-- Name: ProductVariants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ProductVariants_id_seq"', 1000, true);


--
-- TOC entry 3951 (class 0 OID 0)
-- Dependencies: 224
-- Name: Products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Products_id_seq"', 181, true);


--
-- TOC entry 3952 (class 0 OID 0)
-- Dependencies: 250
-- Name: Requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Requests_id_seq"', 1, false);


--
-- TOC entry 3953 (class 0 OID 0)
-- Dependencies: 258
-- Name: ReturnRequests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ReturnRequests_id_seq"', 1, false);


--
-- TOC entry 3954 (class 0 OID 0)
-- Dependencies: 230
-- Name: Reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Reviews_id_seq"', 1, false);


--
-- TOC entry 3955 (class 0 OID 0)
-- Dependencies: 262
-- Name: RoomChat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."RoomChat_id_seq"', 1, true);


--
-- TOC entry 3956 (class 0 OID 0)
-- Dependencies: 254
-- Name: ShipmentItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ShipmentItems_id_seq"', 1, false);


--
-- TOC entry 3957 (class 0 OID 0)
-- Dependencies: 238
-- Name: Shipments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Shipments_id_seq"', 1, false);


--
-- TOC entry 3958 (class 0 OID 0)
-- Dependencies: 222
-- Name: SizeProfiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."SizeProfiles_id_seq"', 1, false);


--
-- TOC entry 3959 (class 0 OID 0)
-- Dependencies: 248
-- Name: UserVouchers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UserVouchers_id_seq"', 19, true);


--
-- TOC entry 3960 (class 0 OID 0)
-- Dependencies: 218
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 13, true);


--
-- TOC entry 3961 (class 0 OID 0)
-- Dependencies: 246
-- Name: Vouchers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Vouchers_id_seq"', 20, true);


--
-- TOC entry 3552 (class 2606 OID 72690)
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- TOC entry 3611 (class 2606 OID 72805)
-- Name: CartItems CartItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_pkey" PRIMARY KEY (id);


--
-- TOC entry 3607 (class 2606 OID 72797)
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);


--
-- TOC entry 3565 (class 2606 OID 72721)
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- TOC entry 3629 (class 2606 OID 73235)
-- Name: Color Color_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Color"
    ADD CONSTRAINT "Color_pkey" PRIMARY KEY (id);


--
-- TOC entry 3643 (class 2606 OID 73671)
-- Name: GhnPickShift GhnPickShift_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GhnPickShift"
    ADD CONSTRAINT "GhnPickShift_pkey" PRIMARY KEY (id);


--
-- TOC entry 3582 (class 2606 OID 72752)
-- Name: Media Media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_pkey" PRIMARY KEY (id);


--
-- TOC entry 3651 (class 2606 OID 73760)
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- TOC entry 3655 (class 2606 OID 73852)
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- TOC entry 3594 (class 2606 OID 72771)
-- Name: OrderItems OrderItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_pkey" PRIMARY KEY (id);


--
-- TOC entry 3589 (class 2606 OID 72763)
-- Name: Orders Orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_pkey" PRIMARY KEY (id);


--
-- TOC entry 3635 (class 2606 OID 73432)
-- Name: PackageChecksums PackageChecksums_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PackageChecksums"
    ADD CONSTRAINT "PackageChecksums_pkey" PRIMARY KEY (id);


--
-- TOC entry 3603 (class 2606 OID 72789)
-- Name: Payments Payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_pkey" PRIMARY KEY (id);


--
-- TOC entry 3570 (class 2606 OID 72731)
-- Name: ProductVariants ProductVariants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariants"
    ADD CONSTRAINT "ProductVariants_pkey" PRIMARY KEY (id);


--
-- TOC entry 3558 (class 2606 OID 72711)
-- Name: Products Products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_pkey" PRIMARY KEY (id);


--
-- TOC entry 3623 (class 2606 OID 72838)
-- Name: Requests Requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Requests"
    ADD CONSTRAINT "Requests_pkey" PRIMARY KEY (id);


--
-- TOC entry 3639 (class 2606 OID 73501)
-- Name: ReturnRequests ReturnRequests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReturnRequests"
    ADD CONSTRAINT "ReturnRequests_pkey" PRIMARY KEY (id);


--
-- TOC entry 3577 (class 2606 OID 72741)
-- Name: Reviews Reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_pkey" PRIMARY KEY (id);


--
-- TOC entry 3645 (class 2606 OID 73743)
-- Name: RoomChat RoomChat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RoomChat"
    ADD CONSTRAINT "RoomChat_pkey" PRIMARY KEY (id);


--
-- TOC entry 3631 (class 2606 OID 73331)
-- Name: ShipmentItems ShipmentItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShipmentItems"
    ADD CONSTRAINT "ShipmentItems_pkey" PRIMARY KEY (id);


--
-- TOC entry 3599 (class 2606 OID 72780)
-- Name: Shipments Shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shipments"
    ADD CONSTRAINT "Shipments_pkey" PRIMARY KEY (id);


--
-- TOC entry 3555 (class 2606 OID 72700)
-- Name: SizeProfiles SizeProfiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SizeProfiles"
    ADD CONSTRAINT "SizeProfiles_pkey" PRIMARY KEY (id);


--
-- TOC entry 3647 (class 2606 OID 73750)
-- Name: UserRoomChat UserRoomChat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRoomChat"
    ADD CONSTRAINT "UserRoomChat_pkey" PRIMARY KEY ("userId", "roomChatId");


--
-- TOC entry 3619 (class 2606 OID 72827)
-- Name: UserVouchers UserVouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserVouchers"
    ADD CONSTRAINT "UserVouchers_pkey" PRIMARY KEY (id);


--
-- TOC entry 3548 (class 2606 OID 72583)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 3616 (class 2606 OID 72818)
-- Name: Vouchers Vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vouchers"
    ADD CONSTRAINT "Vouchers_pkey" PRIMARY KEY (id);


--
-- TOC entry 3544 (class 2606 OID 72566)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3608 (class 1259 OID 73004)
-- Name: Cart_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Cart_userId_key" ON public."Cart" USING btree ("userId");


--
-- TOC entry 3563 (class 1259 OID 72851)
-- Name: Category_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);


--
-- TOC entry 3627 (class 1259 OID 73236)
-- Name: Color_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Color_name_key" ON public."Color" USING btree (name);


--
-- TOC entry 3583 (class 1259 OID 72853)
-- Name: Media_url_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Media_url_key" ON public."Media" USING btree (url);


--
-- TOC entry 3604 (class 1259 OID 72858)
-- Name: Payments_transactionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Payments_transactionId_key" ON public."Payments" USING btree ("transactionId");


--
-- TOC entry 3571 (class 1259 OID 72852)
-- Name: ProductVariants_stockKeepingUnit_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductVariants_stockKeepingUnit_key" ON public."ProductVariants" USING btree ("stockKeepingUnit");


--
-- TOC entry 3559 (class 1259 OID 72850)
-- Name: Products_stockKeepingUnit_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Products_stockKeepingUnit_key" ON public."Products" USING btree ("stockKeepingUnit");


--
-- TOC entry 3640 (class 1259 OID 73502)
-- Name: ReturnRequests_requestId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ReturnRequests_requestId_key" ON public."ReturnRequests" USING btree ("requestId");


--
-- TOC entry 3597 (class 1259 OID 73334)
-- Name: Shipments_ghnOrderCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Shipments_ghnOrderCode_key" ON public."Shipments" USING btree ("ghnOrderCode");


--
-- TOC entry 3545 (class 1259 OID 72586)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 3546 (class 1259 OID 73227)
-- Name: User_googleId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_googleId_key" ON public."User" USING btree ("googleId");


--
-- TOC entry 3549 (class 1259 OID 73005)
-- Name: User_staffCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_staffCode_key" ON public."User" USING btree ("staffCode");


--
-- TOC entry 3550 (class 1259 OID 72584)
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- TOC entry 3614 (class 1259 OID 72860)
-- Name: Vouchers_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Vouchers_code_key" ON public."Vouchers" USING btree (code);


--
-- TOC entry 3553 (class 1259 OID 73283)
-- Name: idx_address_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_address_user_id ON public."Address" USING btree ("userId");


--
-- TOC entry 3612 (class 1259 OID 73286)
-- Name: idx_cartItem_cart_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_cartItem_cart_id" ON public."CartItems" USING btree ("cartId");


--
-- TOC entry 3613 (class 1259 OID 73287)
-- Name: idx_cartItem_product_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_cartItem_product_variant_id" ON public."CartItems" USING btree ("productVariantId");


--
-- TOC entry 3609 (class 1259 OID 73285)
-- Name: idx_cart_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_user_id ON public."Cart" USING btree ("userId");


--
-- TOC entry 3566 (class 1259 OID 73291)
-- Name: idx_category_created_by_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_category_created_by_user_id ON public."Category" USING btree ("createByUserId");


--
-- TOC entry 3567 (class 1259 OID 73288)
-- Name: idx_category_parent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_category_parent_id ON public."Category" USING btree ("parentId");


--
-- TOC entry 3568 (class 1259 OID 73290)
-- Name: idx_category_voucher_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_category_voucher_id ON public."Category" USING btree ("voucherId");


--
-- TOC entry 3584 (class 1259 OID 73294)
-- Name: idx_media_product_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_product_variant_id ON public."Media" USING btree ("productVariantId");


--
-- TOC entry 3585 (class 1259 OID 73295)
-- Name: idx_media_request_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_request_id ON public."Media" USING btree ("requestId");


--
-- TOC entry 3586 (class 1259 OID 73292)
-- Name: idx_media_review_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_review_id ON public."Media" USING btree ("reviewId");


--
-- TOC entry 3587 (class 1259 OID 73293)
-- Name: idx_media_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_user_id ON public."Media" USING btree ("userId");


--
-- TOC entry 3652 (class 1259 OID 73764)
-- Name: idx_message_room_chat_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_room_chat_id ON public."Message" USING btree ("roomChatId");


--
-- TOC entry 3653 (class 1259 OID 73763)
-- Name: idx_message_sender_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_sender_id ON public."Message" USING btree ("senderId");


--
-- TOC entry 3656 (class 1259 OID 73853)
-- Name: idx_notification_creator_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_creator_id ON public."Notification" USING btree ("creatorId");


--
-- TOC entry 3657 (class 1259 OID 73854)
-- Name: idx_notification_recipient_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_recipient_id ON public."Notification" USING btree ("recipientId");


--
-- TOC entry 3595 (class 1259 OID 73296)
-- Name: idx_orderItem_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_orderItem_order_id" ON public."OrderItems" USING btree ("orderId");


--
-- TOC entry 3596 (class 1259 OID 73297)
-- Name: idx_orderItem_product_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_orderItem_product_variant_id" ON public."OrderItems" USING btree ("productVariantId");


--
-- TOC entry 3590 (class 1259 OID 73300)
-- Name: idx_order_processed_by_staff_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_processed_by_staff_id ON public."Orders" USING btree ("processByStaffId");


--
-- TOC entry 3591 (class 1259 OID 73299)
-- Name: idx_order_shipping_address_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_shipping_address_id ON public."Orders" USING btree ("shippingAddressId");


--
-- TOC entry 3592 (class 1259 OID 73298)
-- Name: idx_order_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_user_id ON public."Orders" USING btree ("userId");


--
-- TOC entry 3636 (class 1259 OID 73434)
-- Name: idx_packageChecksum_ghn_shop_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_packageChecksum_ghn_shop_id" ON public."PackageChecksums" USING btree ("ghnShopId");


--
-- TOC entry 3637 (class 1259 OID 73433)
-- Name: idx_packageChecksum_shop_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_packageChecksum_shop_id" ON public."PackageChecksums" USING btree ("shopId");


--
-- TOC entry 3605 (class 1259 OID 73301)
-- Name: idx_payment_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_order_id ON public."Payments" USING btree ("orderId");


--
-- TOC entry 3572 (class 1259 OID 73304)
-- Name: idx_productVariant_color_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_productVariant_color_id" ON public."ProductVariants" USING btree ("colorId");


--
-- TOC entry 3573 (class 1259 OID 73305)
-- Name: idx_productVariant_created_by_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_productVariant_created_by_user_id" ON public."ProductVariants" USING btree ("createByUserId");


--
-- TOC entry 3574 (class 1259 OID 73302)
-- Name: idx_productVariant_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_productVariant_product_id" ON public."ProductVariants" USING btree ("productId");


--
-- TOC entry 3575 (class 1259 OID 73303)
-- Name: idx_productVariant_voucher_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_productVariant_voucher_id" ON public."ProductVariants" USING btree ("voucherId");


--
-- TOC entry 3560 (class 1259 OID 73306)
-- Name: idx_product_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_category_id ON public."Products" USING btree ("categoryId");


--
-- TOC entry 3561 (class 1259 OID 73309)
-- Name: idx_product_created_by_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_created_by_user_id ON public."Products" USING btree ("createByUserId");


--
-- TOC entry 3562 (class 1259 OID 73308)
-- Name: idx_product_voucher_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_voucher_id ON public."Products" USING btree ("voucherId");


--
-- TOC entry 3624 (class 1259 OID 73312)
-- Name: idx_request_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_request_order_id ON public."Requests" USING btree ("orderId");


--
-- TOC entry 3625 (class 1259 OID 73311)
-- Name: idx_request_processed_by_staff_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_request_processed_by_staff_id ON public."Requests" USING btree ("processByStaffId");


--
-- TOC entry 3626 (class 1259 OID 73310)
-- Name: idx_request_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_request_user_id ON public."Requests" USING btree ("userId");


--
-- TOC entry 3641 (class 1259 OID 73503)
-- Name: idx_returnRequest_request_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_returnRequest_request_id" ON public."ReturnRequests" USING btree ("requestId");


--
-- TOC entry 3578 (class 1259 OID 73314)
-- Name: idx_review_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_review_product_id ON public."Reviews" USING btree ("productId");


--
-- TOC entry 3579 (class 1259 OID 73316)
-- Name: idx_review_product_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_review_product_variant_id ON public."Reviews" USING btree ("productVariantId");


--
-- TOC entry 3580 (class 1259 OID 73315)
-- Name: idx_review_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_review_user_id ON public."Reviews" USING btree ("userId");


--
-- TOC entry 3632 (class 1259 OID 73333)
-- Name: idx_shipmentItem_order_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_shipmentItem_order_item_id" ON public."ShipmentItems" USING btree ("orderItemId");


--
-- TOC entry 3633 (class 1259 OID 73332)
-- Name: idx_shipmentItem_shipment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_shipmentItem_shipment_id" ON public."ShipmentItems" USING btree ("shipmentId");


--
-- TOC entry 3600 (class 1259 OID 73317)
-- Name: idx_shipment_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipment_order_id ON public."Shipments" USING btree ("orderId");


--
-- TOC entry 3601 (class 1259 OID 73318)
-- Name: idx_shipment_processed_by_staff_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipment_processed_by_staff_id ON public."Shipments" USING btree ("processByStaffId");


--
-- TOC entry 3556 (class 1259 OID 73319)
-- Name: idx_sizeProfile_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_sizeProfile_user_id" ON public."SizeProfiles" USING btree ("userId");


--
-- TOC entry 3648 (class 1259 OID 73762)
-- Name: idx_userRoomChat_room_chat_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_userRoomChat_room_chat_id" ON public."UserRoomChat" USING btree ("roomChatId");


--
-- TOC entry 3649 (class 1259 OID 73761)
-- Name: idx_userRoomChat_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_userRoomChat_user_id" ON public."UserRoomChat" USING btree ("userId");


--
-- TOC entry 3620 (class 1259 OID 73321)
-- Name: idx_userVoucher_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_userVoucher_user_id" ON public."UserVouchers" USING btree ("userId");


--
-- TOC entry 3621 (class 1259 OID 73322)
-- Name: idx_userVoucher_voucher_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_userVoucher_voucher_id" ON public."UserVouchers" USING btree ("voucherId");


--
-- TOC entry 3617 (class 1259 OID 73323)
-- Name: idx_voucher_created_by_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_voucher_created_by_user_id ON public."Vouchers" USING btree ("createdBy");


--
-- TOC entry 3658 (class 2606 OID 72873)
-- Name: Address Address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3690 (class 2606 OID 72963)
-- Name: CartItems CartItems_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3691 (class 2606 OID 72968)
-- Name: CartItems CartItems_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public."ProductVariants"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3689 (class 2606 OID 73021)
-- Name: Cart Cart_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3663 (class 2606 OID 73094)
-- Name: Category Category_createByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_createByUserId_fkey" FOREIGN KEY ("createByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3664 (class 2606 OID 73089)
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3665 (class 2606 OID 73179)
-- Name: Category Category_voucherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES public."Vouchers"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3673 (class 2606 OID 73353)
-- Name: Media Media_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3674 (class 2606 OID 72923)
-- Name: Media Media_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public."ProductVariants"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3675 (class 2606 OID 73221)
-- Name: Media Media_requestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES public."Requests"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3676 (class 2606 OID 72913)
-- Name: Media Media_reviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES public."Reviews"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3677 (class 2606 OID 72918)
-- Name: Media Media_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3704 (class 2606 OID 73780)
-- Name: Message Message_roomChatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_roomChatId_fkey" FOREIGN KEY ("roomChatId") REFERENCES public."RoomChat"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3705 (class 2606 OID 73775)
-- Name: Message Message_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3706 (class 2606 OID 73855)
-- Name: Notification Notification_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3707 (class 2606 OID 73860)
-- Name: Notification Notification_recipientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3682 (class 2606 OID 73467)
-- Name: OrderItems OrderItems_appliedVoucherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_appliedVoucherId_fkey" FOREIGN KEY ("appliedVoucherId") REFERENCES public."Vouchers"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3683 (class 2606 OID 73124)
-- Name: OrderItems OrderItems_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3684 (class 2606 OID 73129)
-- Name: OrderItems OrderItems_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public."ProductVariants"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3678 (class 2606 OID 73477)
-- Name: Orders Orders_packageChecksumsId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_packageChecksumsId_fkey" FOREIGN KEY ("packageChecksumsId") REFERENCES public."PackageChecksums"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3679 (class 2606 OID 73119)
-- Name: Orders Orders_processByStaffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_processByStaffId_fkey" FOREIGN KEY ("processByStaffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3680 (class 2606 OID 73114)
-- Name: Orders Orders_shippingAddressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES public."Address"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3681 (class 2606 OID 73109)
-- Name: Orders Orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3688 (class 2606 OID 73144)
-- Name: Payments Payments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3666 (class 2606 OID 73237)
-- Name: ProductVariants ProductVariants_colorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariants"
    ADD CONSTRAINT "ProductVariants_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES public."Color"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3667 (class 2606 OID 73099)
-- Name: ProductVariants ProductVariants_createByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariants"
    ADD CONSTRAINT "ProductVariants_createByUserId_fkey" FOREIGN KEY ("createByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3668 (class 2606 OID 72893)
-- Name: ProductVariants ProductVariants_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariants"
    ADD CONSTRAINT "ProductVariants_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3669 (class 2606 OID 73184)
-- Name: ProductVariants ProductVariants_voucherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariants"
    ADD CONSTRAINT "ProductVariants_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES public."Vouchers"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3660 (class 2606 OID 73041)
-- Name: Products Products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3661 (class 2606 OID 73084)
-- Name: Products Products_createByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_createByUserId_fkey" FOREIGN KEY ("createByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3662 (class 2606 OID 73174)
-- Name: Products Products_voucherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES public."Vouchers"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3696 (class 2606 OID 73164)
-- Name: Requests Requests_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Requests"
    ADD CONSTRAINT "Requests_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3697 (class 2606 OID 73159)
-- Name: Requests Requests_processByStaffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Requests"
    ADD CONSTRAINT "Requests_processByStaffId_fkey" FOREIGN KEY ("processByStaffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3698 (class 2606 OID 73154)
-- Name: Requests Requests_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Requests"
    ADD CONSTRAINT "Requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3701 (class 2606 OID 73504)
-- Name: ReturnRequests ReturnRequests_requestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReturnRequests"
    ADD CONSTRAINT "ReturnRequests_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES public."Requests"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3670 (class 2606 OID 72898)
-- Name: Reviews Reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3671 (class 2606 OID 72908)
-- Name: Reviews Reviews_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public."ProductVariants"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3672 (class 2606 OID 73104)
-- Name: Reviews Reviews_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3699 (class 2606 OID 73346)
-- Name: ShipmentItems ShipmentItems_orderItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShipmentItems"
    ADD CONSTRAINT "ShipmentItems_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES public."OrderItems"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3700 (class 2606 OID 73341)
-- Name: ShipmentItems ShipmentItems_shipmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShipmentItems"
    ADD CONSTRAINT "ShipmentItems_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES public."Shipments"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3685 (class 2606 OID 73672)
-- Name: Shipments Shipments_ghnPickShiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shipments"
    ADD CONSTRAINT "Shipments_ghnPickShiftId_fkey" FOREIGN KEY ("ghnPickShiftId") REFERENCES public."GhnPickShift"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3686 (class 2606 OID 73134)
-- Name: Shipments Shipments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shipments"
    ADD CONSTRAINT "Shipments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3687 (class 2606 OID 73139)
-- Name: Shipments Shipments_processByStaffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shipments"
    ADD CONSTRAINT "Shipments_processByStaffId_fkey" FOREIGN KEY ("processByStaffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3659 (class 2606 OID 73006)
-- Name: SizeProfiles SizeProfiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SizeProfiles"
    ADD CONSTRAINT "SizeProfiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3702 (class 2606 OID 73770)
-- Name: UserRoomChat UserRoomChat_roomChatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRoomChat"
    ADD CONSTRAINT "UserRoomChat_roomChatId_fkey" FOREIGN KEY ("roomChatId") REFERENCES public."RoomChat"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3703 (class 2606 OID 73765)
-- Name: UserRoomChat UserRoomChat_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRoomChat"
    ADD CONSTRAINT "UserRoomChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3693 (class 2606 OID 73472)
-- Name: UserVouchers UserVouchers_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserVouchers"
    ADD CONSTRAINT "UserVouchers_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3694 (class 2606 OID 73031)
-- Name: UserVouchers UserVouchers_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserVouchers"
    ADD CONSTRAINT "UserVouchers_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3695 (class 2606 OID 72983)
-- Name: UserVouchers UserVouchers_voucherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserVouchers"
    ADD CONSTRAINT "UserVouchers_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES public."Vouchers"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3692 (class 2606 OID 73149)
-- Name: Vouchers Vouchers_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vouchers"
    ADD CONSTRAINT "Vouchers_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3911 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-04-17 08:19:47

--
-- PostgreSQL database dump complete
--

