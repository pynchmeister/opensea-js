import 'isomorphic-unfetch'
import * as QueryString from 'query-string'
import { Network, OpenSeaAPIConfig, OrderJSON, Order, OrderbookResponse, OpenSeaAsset, OpenSeaAssetJSON, OpenSeaAssetBundle, OpenSeaAssetBundleJSON, FungibleToken} from './types'
import { orderFromJSON, assetFromJSON, assetBundleFromJSON, tokenFromJSON } from './utils'

export const ORDERBOOK_VERSION: number = 1
export const API_VERSION: number = 1
export const API_BASE_MAINNET = 'https://api.opensea.io'
export const API_BASE_RINKEBY = 'https://rinkeby-api.opensea.io'
export const SITE_HOST_MAINNET = 'https://opensea.io'
export const SITE_HOST_RINKEBY = 'https://rinkeby.opensea.io'

const ORDERBOOK_PATH = `/wyvern/v${ORDERBOOK_VERSION}`
const API_PATH = `/api/v${ORDERBOOK_VERSION}`

export class OpenSeaAPI {

  /**
   * Host url for OpenSea
   */
  public readonly hostUrl: string
  /**
   * Base url for the API
   */
  public readonly apiBaseUrl: string
  /**
   * Page size to use for fetching orders
   */
  public pageSize = 20
  /**
   * Logger function to use when debugging
   */
  public logger: (arg: string) => void

  private apiKey: string | undefined

  /**
   * Create an instance of the OpenSea API
   * @param config OpenSeaAPIConfig for setting up the API, including an optional API key, network name, and base URL
   * @param logger Optional function for logging debug strings before and after requests are made
   */
  constructor(config: OpenSeaAPIConfig, logger?: (arg: string) => void) {
    this.apiKey = config.apiKey

    switch (config.networkName) {
      case Network.Rinkeby:
        this.apiBaseUrl = config.apiBaseUrl || API_BASE_RINKEBY
        this.hostUrl = SITE_HOST_RINKEBY
        break
      case Network.Main:
      default:
        this.apiBaseUrl = config.apiBaseUrl || API_BASE_MAINNET
        this.hostUrl = SITE_HOST_MAINNET
        break
    }

    // Debugging: default to nothing
    this.logger = logger || ((arg: string) => arg)
  }

  /**
   * Send an order to the orderbook.
   * Throws when the order is invalid.
   * IN NEXT VERSION: change order input to Order type
   * @param order Order to post to the orderbook
   */
  public async postOrder(order: OrderJSON): Promise<Order> {

    const response = await this.post(
      `${ORDERBOOK_PATH}/orders/post`,
      order,
    )
    const json: OrderJSON = await response.json()
    return orderFromJSON(json)
  }

  /**
   * Get an order from the orderbook, returning `null` if none are found.
   * @param query Query to use for getting orders. A subset of parameters
   *  on the `OrderJSON` type is supported
   */
  public async getOrder(query: Partial<OrderJSON>): Promise<Order | null> {

    const response = await this.get(
      `${ORDERBOOK_PATH}/orders`,
      query
    )

    if (ORDERBOOK_VERSION == 0) {
      const json: OrderJSON[] = await response.json()
      const orderJSON = json[0]
      return orderJSON ? orderFromJSON(orderJSON) : null
    } else {
      const json: OrderbookResponse = await response.json()
      const orderJSON = json.orders[0]
      return orderJSON ? orderFromJSON(orderJSON) : null
    }
  }

  /**
   * Get a list of orders from the orderbook, returning the page of orders
   *  and the count of total orders found.
   * @param query Query to use for getting orders. A subset of parameters
   *  on the `OrderJSON` type is supported
   * @param page Page number, defaults to 1
   */
  public async getOrders(
      query: Partial<OrderJSON> = {},
      page = 1
    ): Promise<{orders: Order[]; count: number}> {

    const response = await this.get(
      `${ORDERBOOK_PATH}/orders`,
      {
        ...query,
        limit: this.pageSize,
        offset: (page - 1) * this.pageSize
      }
    )

    if (ORDERBOOK_VERSION == 0) {
      const json: OrderJSON[] = await response.json()
      return {
        orders: json.map(j => orderFromJSON(j)),
        count: json.length
      }
    } else {
      const json: OrderbookResponse = await response.json()
      return {
        orders: json.orders.map(j => orderFromJSON(j)),
        count: json.count
      }
    }
  }

  /**
   * Fetch an asset from the API, return null if it isn't found
   * @param tokenAddress Address of the asset's contract
   * @param tokenId The asset's token ID
   */
  public async getAsset(tokenAddress: string, tokenId: string | number): Promise<OpenSeaAsset | null> {

    const response = await this.get(`${API_PATH}/asset/${tokenAddress}/${tokenId}`)

    const json: any = await response.json()
    return json ? assetFromJSON(json) : null
  }

  /**
   * Fetch list of assets from the API, returning the page of assets and the count of total assets
   * @param query Query to use for getting orders. A subset of parameters on the `OpenSeaAssetJSON` type is supported
   * @param page Page number, defaults to 1
   */
  public async getAssets(
      query: Partial<OpenSeaAssetJSON> = {},
      page = 1
    ): Promise<{assets: OpenSeaAsset[]; estimatedCount: number}> {

    const response = await this.get(`${API_PATH}/assets/`, {
      ...query,
      limit: this.pageSize,
      offset: (page - 1) * this.pageSize
    })

    const json: any = await response.json()
    return {
      assets: json.assets.map((j: any) => assetFromJSON(j)),
      estimatedCount: json.estimated_count
    }
  }

  /**
   * Fetch list of fungible tokens from the API matching paramters
   * @param query Query to use for getting orders. A subset of parameters on the `OpenSeaAssetJSON` type is supported
   * @param page Page number, defaults to 1
   */
  public async getTokens(
      query: Partial<FungibleToken> = {},
      page = 1
    ): Promise<{tokens: FungibleToken[]}> {

    const response = await this.get(`${API_PATH}/tokens/`, {
      ...query,
      limit: this.pageSize,
      offset: (page - 1) * this.pageSize
    })

    const json: any = await response.json()
    return {
      tokens: json.map((t: any) => tokenFromJSON(t))
    }
  }

  /**
   * Fetch an bundle from the API, return null if it isn't found
   * @param tokenAddress Address of the bundle's contract
   * @param tokenId The bundle's token ID
   */
  public async getBundle(slug: string): Promise<OpenSeaAssetBundle | null> {

    const response = await this.get(`${API_PATH}/bundle/${slug}/`)

    const json: any = await response.json()
    return json ? assetBundleFromJSON(json) : null
  }

  /**
   * Fetch list of bundles from the API, returning the page of bundles and the count of total bundles
   * @param query Query to use for getting orders. A subset of parameters on the `OpenSeaAssetBundleJSON` type is supported
   * @param page Page number, defaults to 1
   */
  public async getBundles(
      query: Partial<OpenSeaAssetBundleJSON> = {},
      page = 1
    ): Promise<{bundles: OpenSeaAssetBundle[]; estimatedCount: number}> {

    const response = await this.get(`${API_PATH}/bundles/`, {
      ...query,
      limit: this.pageSize,
      offset: (page - 1) * this.pageSize
    })

    const json: any = await response.json()
    return {
      bundles: json.bundles.map((j: any) => assetBundleFromJSON(j)),
      estimatedCount: json.estimated_count
    }
  }

  /**
   * Get JSON data from API, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param query Data to send. Will be stringified using QueryString
   */
  public async get(apiPath: string, query: object = {}) {

    const qs = QueryString.stringify(query)
    const url = `${apiPath}?${qs}`

    return this._fetch(url)
  }

  /**
   * POST JSON data to API, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param body Data to send. Will be JSON.stringified
   * @param opts RequestInit opts, similar to Fetch API. If it contains
   *  a body, it won't be stringified.
   */
  public async post(apiPath: string, body?: object, opts: RequestInit = {}) {

    const fetchOpts = {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      ...opts
    }

    return this._fetch(apiPath, fetchOpts)
  }

  /**
   * PUT JSON data to API, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param body Data to send
   * @param opts RequestInit opts, similar to Fetch API. If it contains
   *  a body, it won't be stringified.
   */
  public async put(apiPath: string, body: object, opts: RequestInit = {}) {

    return this.post(apiPath, body, {
      method: 'PUT',
      ...opts
    })
  }

  /**
   * Get from an API Endpoint, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param opts RequestInit opts, similar to Fetch API
   */
  private async _fetch(apiPath: string, opts: RequestInit = {}) {

    const apiBase = this.apiBaseUrl
    const apiKey = this.apiKey
    const finalUrl = apiBase + apiPath
    const finalOpts = {
      ...opts,
      headers: {
        ...(apiKey ? { 'X-API-KEY': apiKey } : {}),
        ...(opts.headers || {}),
      }
    }

    this.logger(`Sending request: ${finalUrl} ${JSON.stringify(finalOpts).substr(0, 100)}...`)

    return fetch(finalUrl, finalOpts).then(async res => this._handleApiResponse(res))
  }

  private async _handleApiResponse(response: Response) {
    if (response.ok) {
      this.logger(`Got success: ${response.status}`)
      return response
    }

    let result
    let errorMessage
    try {
      result = await response.text()
      result = JSON.parse(result)
    } catch {
      // Result will be undefined or text
    }

    this.logger(`Got error ${response.status}: ${JSON.stringify(result)}`)

    switch (response.status) {
      case 400:
        errorMessage = result && result.errors
          ? result.errors.join(', ')
          : `Invalid request: ${JSON.stringify(result)}`
        break
      case 401:
      case 403:
        errorMessage = `Unauthorized. Full message was '${JSON.stringify(result)}'`
        break
      case 404:
        errorMessage = `Not found. Full message was '${JSON.stringify(result)}'`
        break
      case 500:
        errorMessage = `Internal server error. OpenSea has been alerted, but if the problem persists please contact us via Discord: https://discord.gg/ga8EJbv - full message was ${JSON.stringify(result)}`
        break
      default:
        errorMessage = `status code ${response.status}. Message: ${JSON.stringify(result)}`
        break
    }

    throw new Error(`API Error: ${errorMessage}`)
  }
}
