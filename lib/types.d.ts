import BigNumber from 'bignumber.js';
import * as Web3 from 'web3';
import { Network, HowToCall, ECSignature, Order as WyvernOrder } from 'wyvern-js/lib/types';
import { FungibleToken } from 'wyvern-schemas';
export { Network, HowToCall, ECSignature, FungibleToken };
/**
 * Events emitted by the SDK. There are five types:
 * 1. Transaction events, which tell you when a new transaction was
 *    created, confirmed, denied, or failed.
 * 2. pre-transaction events, which are named (like "WrapEth") and indicate
 *    that Web3 is asking for a signature on a transaction that needs to occur before
 *    an order is made or fulfilled. This includes approval events and account
 *    initialization.
 * 3. Basic actions: matching, cancelling, and creating orders.
 *    The "CreateOrder" event fires when a signature is being prompted
 *    to create an off-chain order. The "OrderDenied" event fires when a signature
 *    request is denied by the user.
 * 4. The "TransferAll" event, which fires when a user is about to directly
 *    transfer one or more assets to another account
 */
export declare enum EventType {
    TransactionCreated = "TransactionCreated",
    TransactionConfirmed = "TransactionConfirmed",
    TransactionDenied = "TransactionDenied",
    TransactionFailed = "TransactionFailed",
    InitializeAccount = "InitializeAccount",
    WrapEth = "WrapEth",
    UnwrapWeth = "UnwrapWeth",
    ApproveCurrency = "ApproveCurrency",
    ApproveAsset = "ApproveAsset",
    ApproveAllAssets = "ApproveAllAssets",
    MatchOrders = "MatchOrders",
    CancelOrder = "CancelOrder",
    CreateOrder = "CreateOrder",
    OrderDenied = "OrderDenied",
    TransferAll = "TransferAll"
}
/**
 * Data that gets sent with each EventType
 */
export interface EventData {
    accountAddress?: string;
    toAddress?: string;
    proxyAddress?: string;
    amount?: BigNumber;
    tokenAddress?: string;
    tokenId?: string;
    assets?: Asset[];
    transactionHash?: string;
    event?: EventType;
    error?: Error;
    order?: Order | UnsignedOrder;
    buy?: Order;
    sell?: Order;
    matchMetadata?: string;
}
/**
 * OpenSea API configuration object
 * @param apiKey Optional key to use for API
 * @param networkName `Network` type to use. Defaults to `Network.Main` (mainnet)
 * @param gasPrice Default gas price to send to the Wyvern Protocol
 * @param apiBaseUrl Optional base URL to use for the API
 */
export interface OpenSeaAPIConfig {
    networkName?: Network;
    apiKey?: string;
    apiBaseUrl?: string;
    gasPrice?: BigNumber;
}
/**
 * Wyvern order side: buy or sell.
 */
export declare enum OrderSide {
    Buy = 0,
    Sell = 1
}
/**
 * Wyvern fee method
 * ProtocolFee: Charge maker fee to seller and charge taker fee to buyer.
 * SplitFee: Maker fees are deducted from the token amount that the maker receives. Taker fees are extra tokens that must be paid by the taker.
 */
export declare enum FeeMethod {
    ProtocolFee = 0,
    SplitFee = 1
}
/**
 * Wyvern: type of sale. Fixed or Dutch auction
 * Note: not imported from wyvern.js because it uses
 * EnglishAuction as 1 and DutchAuction as 2
 */
export declare enum SaleKind {
    FixedPrice = 0,
    DutchAuction = 1
}
export declare enum WyvernSchemaName {
    ERC721 = "ERC721"
}
export interface WyvernAsset {
    id: string;
    address: string;
}
export interface WyvernBundle {
    assets: WyvernAsset[];
    name?: string;
    description?: string;
    external_link?: string;
}
export declare type WyvernAtomicMatchParameters = [string[], BigNumber[], Array<(number | BigNumber)>, string, string, string, string, string, string, Array<(number | BigNumber)>, string[]];
/**
 * The OpenSea account object appended to orders, providing extra metadata, profile images and usernames
 */
export interface OpenSeaAccount {
    address: string;
    config: string;
    profile_img_url: string;
    user: null | {
        username: string;
    };
}
/**
 * Simple OpenSea asset spec
 */
export interface Asset {
    tokenId: string;
    tokenAddress: string;
}
/**
 * OpenSea asset contract
 */
export interface OpenSeaAssetContract {
    name: string;
    address: string;
    sellerFeeBasisPoints: number;
    buyerFeeBasisPoints: number;
    openseaSellerFeeBasisPoints: number;
    openseaBuyerFeeBasisPoints: number;
    devSellerFeeBasisPoints: number;
    devBuyerFeeBasisPoints: number;
    description: string;
    tokenSymbol: string;
    imageUrl: string;
    stats?: object;
    traits?: object[];
    externalLink?: string;
    wikiLink?: string;
}
/**
 * The OpenSea asset fetched by the API
 */
export interface OpenSeaAsset extends Asset {
    assetContract: OpenSeaAssetContract;
    name: string;
    description: string;
    owner: OpenSeaAccount;
    orders: Order[] | null;
    buyOrders: Order[] | null;
    sellOrders: Order[] | null;
    isPresale: boolean;
    imageUrl: string;
    imagePreviewUrl: string;
    imageUrlOriginal: string;
    imageUrlThumbnail: string;
    openseaLink: string;
    externalLink: string;
    traits: object[];
    numSales: number;
    lastSale: object | null;
    backgroundColor: string | null;
}
/**
 * Bundles of assets, grouped together into one OpenSea order
 * URLs for bundles are auto-generated from the name
 */
export interface OpenSeaAssetBundle {
    maker: OpenSeaAccount;
    assets: OpenSeaAsset[];
    name: string;
    slug: string;
    permalink: string;
    sellOrders: Order[] | null;
    description?: string;
    externalLink?: string;
}
export interface OpenSeaAssetBundleJSON {
    assets: OpenSeaAsset[];
    name: string;
    description?: string;
    external_link?: string;
    maker?: OpenSeaAccount;
    asset_contract_address?: string;
    token_ids?: Array<number | string>;
    on_sale?: boolean;
    owner?: string;
    offset?: number;
    limit?: number;
    search?: string;
}
/**
 * The basis point values of each type of fee
 * added to each order.
 * The first pair of values are the total of
 * the second two pairs
 */
export interface OpenSeaFees {
    totalBuyerFeeBPS: number;
    totalSellerFeeBPS: number;
    devSellerFeeBPS: number;
    devBuyerFeeBPS: number;
    openseaSellerFeeBPS: number;
    openseaBuyerFeeBPS: number;
    sellerBountyBPS: number;
}
export interface UnhashedOrder extends WyvernOrder {
    feeMethod: FeeMethod;
    side: OrderSide;
    saleKind: SaleKind;
    howToCall: HowToCall;
    makerReferrerFee: BigNumber;
    waitingForBestCounterOrder: boolean;
    metadata: {
        asset?: WyvernAsset;
        bundle?: WyvernBundle;
        schema: WyvernSchemaName;
    };
}
export interface UnsignedOrder extends UnhashedOrder {
    hash: string;
}
export interface Order extends UnsignedOrder, ECSignature {
    currentPrice?: BigNumber;
    currentBounty?: BigNumber;
    makerAccount?: OpenSeaAccount;
    takerAccount?: OpenSeaAccount;
    paymentTokenContract?: FungibleToken;
    feeRecipientAccount?: OpenSeaAccount;
    cancelledOrFinalized?: boolean;
    markedInvalid?: boolean;
    asset?: OpenSeaAsset;
    assetBundle?: OpenSeaAssetBundle;
}
export interface OrderJSON {
    exchange: string;
    maker: string;
    taker: string;
    makerRelayerFee: string;
    takerRelayerFee: string;
    makerProtocolFee: string;
    takerProtocolFee: string;
    feeRecipient: string;
    feeMethod: FeeMethod;
    side: OrderSide;
    saleKind: SaleKind;
    target: string;
    howToCall: HowToCall;
    calldata: string;
    replacementPattern: string;
    staticTarget: string;
    staticExtradata: string;
    paymentToken: string;
    basePrice: string;
    extra: string;
    listingTime: number | string;
    expirationTime: number | string;
    salt: string;
    metadata: {
        asset: WyvernAsset;
        schema: WyvernSchemaName;
    };
    hash: string;
    v?: number;
    r?: string;
    s?: string;
    /**
     * Attrs used by orderbook to make queries easier
     * Includes `maker`, `taker` and `side` from above
     */
    owner?: string;
    sale_kind?: SaleKind;
    asset_contract_address?: string;
    payment_token_address?: string;
    bundled?: boolean;
    token_id?: number | string;
    token_ids?: Array<number | string>;
    listed_after?: number | string;
    listed_before?: number | string;
    limit?: number;
    offset?: number;
}
export interface OpenSeaAssetJSON {
    owner?: string;
    asset_contract_address?: string;
    token_ids?: Array<number | string>;
    search?: string;
    order_by?: string;
    order_direction?: string;
    limit?: number;
    offset?: number;
}
export interface OrderbookResponse {
    orders: OrderJSON[];
    count: number;
}
export declare type Web3Callback<T> = (err: Error | null, result: T) => void;
export declare type Web3RPCCallback = Web3Callback<Web3.JSONRPCResponsePayload>;
export declare type TxnCallback = (result: boolean) => void;
/**
 * To simplify typifying ABIs
 */
export interface PartialAbiDefinition {
    type: Web3.AbiType | string;
    name?: string;
    inputs?: object[];
    outputs?: object[];
    payable?: boolean;
    constant?: boolean;
    anonymous?: boolean;
    stateMutability?: Web3.ConstructorStateMutability | string;
}
export declare type PartialReadonlyContractAbi = Array<Readonly<PartialAbiDefinition>>;
