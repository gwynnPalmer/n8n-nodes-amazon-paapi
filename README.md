![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# Amazon PAAPI Node for n8n

A custom node for [n8n](https://n8n.io/) that interacts with the [Amazon Product Advertising API](https://affiliate-program.amazon.com/). This node allows you to integrate Amazon product data directly into your n8n workflows, enabling automated product searches, lookups, and more.

## Features

- **Seamless Integration:** Easily connect to the Amazon Product Advertising API within your n8n workflows.
- **Flexible Operations:** Perform various operations like item searches, lookups, and other API-supported actions.
- **Customizable:** Configure credentials and settings to match your Amazon PA API account.

## Prerequisites

Before using the node, make sure you have the following:

- **n8n installation:** You need a working installation of n8n. Follow the [n8n installation guide](https://docs.n8n.io/getting-started/installation/) if you haven’t set it up yet.
- **Amazon Product Advertising API credentials:** Sign up and obtain your access keys, secret keys, and associate tags from [Amazon Associates](https://affiliate-program.amazon.com/).

## Installation

1. **Clone or Download the Repository**

	 Clone the repository to your local machine:

	 ```bash
	 git clone https://github.com/gwynnPalmer/n8n-nodes-amazon-paapi.git
	 ```

2. **Add the Node to Your n8n Setup**

	 Copy the `AmazonPaapi` folder from the repository’s `nodes` directory into your n8n custom nodes directory. For example, if you are using a Docker setup or a self-hosted installation, place the node where your n8n instance can load it.

3. **Restart n8n**

	 After adding the node, restart n8n to load the custom node.

## Configuration

### Credentials

To securely access the Amazon Product Advertising API, configure your credentials in n8n:

1. In n8n, navigate to **Credentials**.
2. Create a new credential of type **Amazon PAAPI**.
3. Fill in your **Access Key**, **Secret Key**, and **Associate Tag**.
4. Save the credentials.

### Node Properties

Once the node is added to your workflow, you can configure it with the following properties (refer to the [source file](https://github.com/gwynnPalmer/n8n-nodes-amazon-paapi/blob/master/nodes/AmazonPaapi/AmazonPaapi.node.ts) for the complete list):

- **Resource & Operation:** Select the desired resource and operation (e.g., item lookup, item search).
- **Parameters:** Provide the necessary parameters for the selected operation (such as keywords, item IDs, etc.).

## Usage

1. **Create a Workflow**

	 Open n8n and create a new workflow.

2. **Add the Amazon PAAPI Node**

	 Drag and drop the Amazon PAAPI node into your workflow and configure it with the desired operation and credentials.

3. **Test the Node**

	 Run the workflow to see the node in action. The node will make API calls to Amazon and return the product data based on your parameters.

4. **Integrate with Other Nodes**

	 Use the output from the Amazon PAAPI node in combination with other n8n nodes (e.g., data transformation, notifications, storage) to build comprehensive automation workflows.

## Development

If you want to contribute or customize the node:

1. **Fork the Repository**

	 Fork the repository to your own GitHub account.

2. **Make Your Changes**

	 Update the source code, tests, or documentation as needed.

3. **Submit a Pull Request**

	 Once your changes are complete, submit a pull request with a detailed description of your changes.

For any issues or feature requests, please open an issue on the [GitHub repository](https://github.com/gwynnPalmer/n8n-nodes-amazon-paapi/issues).
