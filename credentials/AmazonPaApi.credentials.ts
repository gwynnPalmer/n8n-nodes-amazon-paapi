import {
	ICredentialType, INodeProperties
} from 'n8n-workflow';

export class AmazonPaApi implements ICredentialType {
	name = 'amazonPaapi';
	displayName = 'Amazon PA API';
	documentationUrl = 'https://webservices.amazon.com/paapi5/documentation/';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Key',
			name: 'accessKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
		{
			displayName: 'Secret Key',
			name: 'secretKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
		{
			displayName: 'Partner Tag',
			name: 'partnerTag',
			type: 'string',
			default: '',
			description: 'Your default Partner Tag (can be overridden per request).',
		},
		{
			displayName: 'Marketplace',
			name: 'marketplace',
			type: 'options',
			options: [
				{ name: 'US', value: 'www.amazon.com' },
				{ name: 'UK', value: 'www.amazon.co.uk' },
				{ name: 'Germany', value: 'www.amazon.de' },
				{ name: 'Japan', value: 'www.amazon.co.jp' },
				{ name: 'Canada', value: 'www.amazon.ca' },
				{ name: 'France', value: 'www.amazon.fr' },
				{ name: 'Italy', value: 'www.amazon.it' },
				{ name: 'Spain', value: 'www.amazon.es' },
				{ name: 'Mexico', value: 'www.amazon.com.mx' },
				{ name: 'Brazil', value: 'www.amazon.com.br' },
				{ name: 'India', value: 'www.amazon.in' },
				{ name: 'Australia', value: 'www.amazon.com.au' },
				{ name: 'China', value: 'www.amazon.cn' },
			],
			default: 'www.amazon.com',
			description: 'The Amazon marketplace you want to use.',
		},
	];
}
