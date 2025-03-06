import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import * as amazonPaapi from 'amazon-paapi';

export class AmazonPaapi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Amazon PA API',
		name: 'amazonPaapi',
		group: ['transform'],
		version: 1,
		description: 'Interact with Amazon Product Advertising API',
		defaults: {
			name: 'Amazon PA API',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'amazonPaapi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Search Items',
						value: 'searchItems',
						description: 'Search for items on Amazon',
						action: 'Search for items on amazon',
					},
				],
				default: 'searchItems',
			},
			{
				displayName: 'Partner Tag',
				name: 'partnerTag',
				type: 'string',
				default: '',
				description: 'Amazon Partner Tag (overrides default if set)',
			},
			// Search Index (Category)
			{
				displayName: 'Search Index',
				name: 'searchIndex',
				type: 'string',
				default: 'All',
				description:
					'Product category to search in. If not set, defaults to "All". Example: Electronics, Books, etc.',
			},
			// Search Criteria (like Keywords, Title, etc.)
			{
				displayName: 'Search Criteria',
				default: {},
				description: 'At least one of these search parameters must be provided',
				name: 'searchCriteria',
				options: [
					{
						displayName: 'Actor',
						name: 'actor',
						type: 'string',
						default: '',
						description: 'Actor name (for Movies & TV category)',
					},
					{
						displayName: 'Artist',
						name: 'artist',
						type: 'string',
						default: '',
						description: 'Artist name (for Music category)',
					},
					{
						displayName: 'Author',
						name: 'author',
						type: 'string',
						default: '',
						description: 'Author name (for Books category)',
					},
					{
						displayName: 'Brand',
						name: 'brand',
						type: 'string',
						default: '',
						description: 'Brand name to filter search results',
					},
					{
						displayName: 'Browse Node ID',
						name: 'browseNodeId',
						type: 'string',
						default: '',
						description: 'Amazon Browse Node ID to restrict the search to a specific category',
					},
					{
						displayName: 'Keywords',
						name: 'keywords',
						type: 'string',
						default: '',
						description: 'Keywords to search for',
					},
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						description: 'Title of the item to search for',
					},
				],
				placeholder: 'Add Search Criteria',
				type: 'collection',
			},
			// Filters (like Price Range, Rating, etc.)
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				options: [
					{
						displayName: 'Availability',
						name: 'availability',
						type: 'options',
						options: [
							{ name: 'Available (In Stock Only)', value: 'Available' },
							{ name: 'Include Out of Stock', value: 'IncludeOutOfStock' },
						],
						default: 'Available',
						description: 'Filter by availability. Defaults to Available items only.',
					},
					{
						displayName: 'Condition',
						name: 'condition',
						type: 'options',
						options: [
							{ name: 'Any', value: 'Any' },
							{ name: 'Collectible', value: 'Collectible' },
							{ name: 'New', value: 'New' },
							{ name: 'Refurbished', value: 'Refurbished' },
							{ name: 'Used', value: 'Used' },
						],
						default: 'Any',
						description: 'Filter by item condition. Defaults to Any.',
					},
					{
						displayName: 'Delivery Flags',
						name: 'deliveryFlags',
						type: 'multiOptions',
						options: [
							{ name: 'AmazonGlobal', value: 'AmazonGlobal' },
							{ name: 'FreeShipping', value: 'FreeShipping' },
							{ name: 'FulfilledByAmazon', value: 'FulfilledByAmazon' },
							{ name: 'Prime', value: 'Prime' },
						],
						default: [],
						description: 'Filter by delivery programs (e.g. Prime eligible, Fulfilled by Amazon)',
					},
					{
						displayName: 'Max Price',
						name: 'maxPrice',
						type: 'number',
						default: 0,
						description: 'Maximum price in the smallest currency unit (e.g. cents)',
					},
					{
						displayName: 'Merchant',
						name: 'merchant',
						type: 'options',
						options: [
							{ name: 'All', value: 'All' },
							{ name: 'Amazon', value: 'Amazon' },
						],
						default: 'All',
						description: 'Filter by seller. "Amazon" returns only items sold by Amazon.',
					},
					{
						displayName: 'Min Price',
						name: 'minPrice',
						type: 'number',
						default: 0,
						description:
							'Minimum price in the smallest currency unit (e.g. cents). Example: 3241 = $32.41.',
					},
					{
						displayName: 'Min Reviews Rating',
						name: 'minReviewsRating',
						type: 'number',
						default: 0,
						description: 'Minimum average customer review rating (1-4)',
					},
					{
						displayName: 'Min Saving Percent',
						name: 'minSavingPercent',
						type: 'number',
						default: 0,
						description: 'Minimum percentage saving for at least one offer (1-99)',
					},
				],
			},
			// Items per page and pagination
			{
				displayName: 'Item Count',
				name: 'itemCount',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 10 },
				default: 10,
				description: 'Number of items to return (1-10). Defaults to 10.',
			},
			{
				displayName: 'Item Page',
				name: 'itemPage',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 10 },
				default: 1,
				description: 'Results page number to retrieve (for pagination). Defaults to 1.',
			},
			// Sort order
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: [
					{ name: 'Avg. Customer Reviews', value: 'AvgCustomerReviews' },
					{ name: 'Default Relevance', value: 'Relevance' },
					{ name: 'Featured', value: 'Featured' },
					{ name: 'Newest Arrivals', value: 'NewestArrivals' },
					{ name: 'Price: High to Low', value: 'Price:HighToLow' },
					{ name: 'Price: Low to High', value: 'Price:LowToHigh' },
				],
				default: 'Relevance',
				description: 'Sort order for results. If not set, uses the default sort for the category.',
			},
			// Resources to return (what data to include)
			{
				displayName: 'Resources',
				name: 'resources',
				type: 'multiOptions',
				options: [
					// ItemInfo Resources
					{ name: 'Item Title', value: 'ItemInfo.Title' },
					{ name: 'Item Content Info', value: 'ItemInfo.ContentInfo' },
					{ name: 'Item Features', value: 'ItemInfo.Features' },
					{ name: 'Item Product Info', value: 'ItemInfo.ProductInfo' },
					{ name: 'Item Technical Info', value: 'ItemInfo.TechnicalInfo' },
					{ name: 'Item By-Line Info', value: 'ItemInfo.ByLineInfo' },
					{ name: 'Item Classifications', value: 'ItemInfo.Classifications' },
					{ name: 'Item External Ids', value: 'ItemInfo.ExternalIds' },
					{ name: 'Item Manufacturer Info', value: 'ItemInfo.ManufactureInfo' },

					// Images Resources
					{ name: 'Primary Image (Small)', value: 'Images.Primary.Small' },
					{ name: 'Primary Image (Medium)', value: 'Images.Primary.Medium' },
					{ name: 'Primary Image (Large)', value: 'Images.Primary.Large' },
					{ name: 'Variant Images', value: 'Images.Variants' },

					// Offers Resources
					{ name: 'Offer Price', value: 'Offers.Listings.Price' },
					{ name: 'Offer Condition', value: 'Offers.Listings.Condition' },
					{ name: 'Offer Availability', value: 'Offers.Listings.Availability' },
					{ name: 'Offer Merchant Info', value: 'Offers.Listings.MerchantInfo' },
					{ name: 'Offer Promotions', value: 'Offers.Listings.Promotions' },
					{ name: 'Offer Summary Counts', value: 'Offers.Summaries.OfferCount' },
					{ name: 'Offer Summary Prices', value: 'Offers.Summaries.LowestPrice' },

					// Other Resources
					{ name: 'Customer Reviews', value: 'CustomerReviews.Count' },
					{ name: 'Customer Ratings', value: 'CustomerReviews.StarRating' },
					{ name: 'Browse Node Info', value: 'BrowseNodeInfo' },
					{ name: 'Parent ASIN', value: 'ParentASIN' },
					{ name: 'Search Refinements', value: 'SearchRefinements' },
				],
				default: ['ItemInfo.Title', 'Offers.Listings.Price', 'Images.Primary.Medium'],
				description: 'Additional data to retrieve for each item',
			},
			// Additional options
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Offer Count',
						name: 'offerCount',
						type: 'number',
						default: 1,
						description: 'Number of offers to return per item. (Currently, only 1 is supported).',
					},
					{
						displayName: 'Currency of Preference',
						name: 'currencyOfPreference',
						type: 'string',
						default: '',
						description:
							"Currency code (ISO 4217, e.g. USD, EUR) for prices. Defaults to marketplace's currency.",
					},
					{
						displayName: 'Languages of Preference',
						name: 'languagesOfPreference',
						type: 'string',
						default: '',
						description:
							'Preferred language(s) for item info (ISO code, e.g. en_US). If multiple, separate with commas.',
					},
					{
						displayName: 'Request Delay',
						name: 'requestDelay',
						type: 'number',
						default: 0,
						description:
							'Delay in milliseconds between API requests to avoid rate limiting (0 = no delay)',
					},
					{
						displayName: 'Jitter Delay',
						name: 'jitterDelay',
						type: 'boolean',
						default: false,
						description:
							'Whether to add random jitter to delay to prevent predictable request patterns',
					},
					{
						displayName: 'Maximum Jitter',
						name: 'maxJitter',
						type: 'number',
						default: 500,
						description:
							'Maximum random delay to add in milliseconds (only used if Jitter Delay is enabled)',
						displayOptions: {
							show: {
								jitterDelay: [true],
							},
						},
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Helper function to create a delay without using setTimeout
		const sleep = async (ms: number): Promise<void> => {
			if (ms <= 0) return Promise.resolve();

			return new Promise((resolve) => {
				const startTime = Date.now();
				// eslint-disable-next-line no-empty
				while (Date.now() - startTime < ms) {}
				resolve();
			});
		};

		// Retrieve credentials
		const credentials = await this.getCredentials('amazonPaapi');

		// Get partnerTag either from the input or from the credentials
		const partnerTag =
			(this.getNodeParameter('partnerTag', 0, '') as string) || (credentials.partnerTag as string);

		// Ensure PartnerTag exists
		if (!partnerTag) {
			throw new NodeOperationError(
				this.getNode(),
				'PartnerTag is required but was not provided in both the request and credentials.',
			);
		}

		const commonParameters = {
			AccessKey: credentials.accessKey as string,
			SecretKey: credentials.secretKey as string,
			PartnerTag: partnerTag,
			Marketplace: credentials.marketplace as string,
			PartnerType: 'Associates',
		};

		// Loop through each item
		for (let i = 0; i < items.length; i++) {
			try {
				// Get delay parameters (if any)
				const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as {
					[key: string]: any;
				};

				// Apply delay if configured and not the first request
				if (i > 0 && additionalOptions.requestDelay) {
					let delayTime = additionalOptions.requestDelay as number;

					// Add random jitter if enabled
					if (additionalOptions.jitterDelay === true) {
						const maxJitter = (additionalOptions.maxJitter as number) || 500;
						delayTime += Math.floor(Math.random() * maxJitter);
					}

					// Only delay if time is greater than zero
					if (delayTime > 0) {
						await sleep(delayTime);
					}
				}

				const operation = this.getNodeParameter('operation', i) as string;

				if (operation === 'searchItems') {
					// Building request parameters for SearchItems
					const requestParameters: any = {};

					// Search Index (Category)
					const searchIndex = this.getNodeParameter('searchIndex', i, 'All') as string;
					if (searchIndex && searchIndex !== 'All') {
						requestParameters.SearchIndex = searchIndex;
					}

					// Search Criteria
					const searchCriteria = this.getNodeParameter('searchCriteria', i, {}) as {
						[key: string]: any;
					};
					if (Object.keys(searchCriteria).length > 0) {
						// Keywords
						if (searchCriteria.keywords) {
							requestParameters.Keywords = searchCriteria.keywords;
						}

						// Title
						if (searchCriteria.title) {
							requestParameters.Title = searchCriteria.title;
						}

						// Actor
						if (searchCriteria.actor) {
							requestParameters.Actor = searchCriteria.actor;
						}

						// Artist
						if (searchCriteria.artist) {
							requestParameters.Artist = searchCriteria.artist;
						}

						// Author
						if (searchCriteria.author) {
							requestParameters.Author = searchCriteria.author;
						}

						// Brand
						if (searchCriteria.brand) {
							requestParameters.Brand = searchCriteria.brand;
						}

						// BrowseNodeId
						if (searchCriteria.browseNodeId) {
							requestParameters.BrowseNodeId = searchCriteria.browseNodeId;
						}
					}

					// Filters
					const filters = this.getNodeParameter('filters', i, {}) as { [key: string]: any };
					if (Object.keys(filters).length > 0) {
						// MinPrice
						if (filters.minPrice) {
							requestParameters.MinPrice = filters.minPrice;
						}

						// MaxPrice
						if (filters.maxPrice) {
							requestParameters.MaxPrice = filters.maxPrice;
						}

						// MinReviewsRating
						if (filters.minReviewsRating) {
							requestParameters.MinReviewsRating = filters.minReviewsRating;
						}

						// MinSavingPercent
						if (filters.minSavingPercent) {
							requestParameters.MinSavingPercent = filters.minSavingPercent;
						}

						// Condition
						if (filters.condition && filters.condition !== 'Any') {
							requestParameters.Condition = filters.condition;
						}

						// Availability
						if (filters.availability) {
							requestParameters.Availability = filters.availability;
						}

						// Merchant
						if (filters.merchant && filters.merchant !== 'All') {
							requestParameters.Merchant = filters.merchant;
						}

						// DeliveryFlags
						if (filters.deliveryFlags && filters.deliveryFlags.length > 0) {
							requestParameters.DeliveryFlags = filters.deliveryFlags;
						}
					}

					// Item Count
					const itemCount = this.getNodeParameter('itemCount', i, 10) as number;
					if (itemCount > 0 && itemCount <= 10) {
						requestParameters.ItemCount = itemCount;
					}

					// Item Page
					const itemPage = this.getNodeParameter('itemPage', i, 1) as number;
					if (itemPage > 0 && itemPage <= 10) {
						requestParameters.ItemPage = itemPage;
					}

					// Sort By
					const sortBy = this.getNodeParameter('sortBy', i, 'Relevance') as string;
					if (sortBy && sortBy !== 'Relevance') {
						requestParameters.SortBy = sortBy;
					}

					// Resources
					const resources = this.getNodeParameter('resources', i, []) as string[];
					if (resources && resources.length > 0) {
						requestParameters.Resources = resources;
					}

					// Additional Options (except delay which is handled separately)
					if (Object.keys(additionalOptions).length > 0) {
						// OfferCount
						if (additionalOptions.offerCount) {
							requestParameters.OfferCount = additionalOptions.offerCount;
						}

						// CurrencyOfPreference
						if (additionalOptions.currencyOfPreference) {
							requestParameters.CurrencyOfPreference = additionalOptions.currencyOfPreference;
						}

						// Languages of Preference
						if (additionalOptions.languagesOfPreference) {
							requestParameters.LanguagesOfPreference = additionalOptions.languagesOfPreference
								.split(',')
								.map((lang: string) => lang.trim());
						}
					}

					// Ensure at least one search criteria is provided
					if (
						!requestParameters.Keywords &&
						!requestParameters.Title &&
						!requestParameters.Actor &&
						!requestParameters.Artist &&
						!requestParameters.Author &&
						!requestParameters.Brand &&
						!requestParameters.BrowseNodeId
					) {
						throw new NodeOperationError(
							this.getNode(),
							'At least one search criteria (e.g., Keywords, Title, Author, etc.) must be provided.',
						);
					}

					// Call the Amazon PA API
					const responseData = await amazonPaapi.SearchItems(commonParameters, requestParameters);

					// Add response to returnData - directly return the raw JSON/object
					returnData.push({
						json: responseData,
					});
				}
			} catch (error) {
				if (error instanceof Error) {
					throw new NodeOperationError(
						this.getNode(),
						`Failed to execute Amazon PA API operation: ${error.message}`,
					);
				} else {
					throw new NodeOperationError(
						this.getNode(),
						'Failed to execute Amazon PA API operation due to an unknown error.',
					);
				}
			}
		}

		// Return the processed data
		return [returnData];
	}
}
