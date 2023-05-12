import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Table, AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";
import { Function, Runtime, Code } from "aws-cdk-lib/aws-lambda";
import { join } from "path";
import {
	NodejsFunction,
	NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
export class AwsMicroservicesServerlessStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const productTable = new Table(this, "product", {
			partitionKey: {
				name: "id",
				type: AttributeType.STRING,
			},
			tableName: "product",
			removalPolicy: RemovalPolicy.DESTROY,
			billingMode: BillingMode.PAY_PER_REQUEST,
		});

		const nodeJsFunctionProps: NodejsFunctionProps = {
			bundling: {
				externalModules: ["aws-sdk"],
			},
			environment: {
				PRIMARY_KEY: "id",
				DYNAMO_TABLE_NAME: productTable.tableName,
			},
			runtime: Runtime.NODEJS_18_X,
			entry: join(__dirname, "/../src/product/index.js"),
		};

		const productFunction = new NodejsFunction(this, "productLambdaFunction", {
			entry: join(__dirname, "/../src/product/index.js"),
			...nodeJsFunctionProps,
		});

		productTable.grantReadWriteData(productFunction);
	}
}
