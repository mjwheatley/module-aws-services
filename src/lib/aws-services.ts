import stream from 'stream';
import * as AWS from 'aws-sdk';
import { GetSecretValueRequest } from 'aws-sdk/clients/secretsmanager';
import {
  CopyObjectRequest,
  GetObjectRequest,
  GetObjectTaggingRequest,
  ListObjectsV2Request,
  PutObjectRequest
} from 'aws-sdk/clients/s3';
import { PublishInput } from 'aws-sdk/clients/sns';
import { GetItemInput } from 'aws-sdk/clients/dynamodb';
import { DeleteMessageRequest, SendMessageRequest } from 'aws-sdk/clients/sqs';
import { StartExecutionInput } from 'aws-sdk/clients/stepfunctions';
import { GetQueryExecutionInput, StartQueryExecutionInput, StopQueryExecutionInput } from 'aws-sdk/clients/athena';
import { SendEmailRequest } from 'aws-sdk/clients/sesv2';

const {
  LOCAL_CLI,
  REGION: region = `us-east-2`
} = process.env;
export const credentials = !!Number(LOCAL_CLI) ?
  new AWS.SharedIniFileCredentials({ profile: `DFT` }) :
  new AWS.EnvironmentCredentials(`AWS`);
if (!!Number(LOCAL_CLI)) {
  AWS.config.credentials = credentials;
}

export { AWS };

const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({ apiVersion: `2006-03-01` });
const sns = new AWS.SNS({ apiVersion: `2010-03-31` });
const pinpoint = new AWS.Pinpoint({ region });
const sqs = new AWS.SQS({ apiVersion: `2012-11-05`, region });
const sm = new AWS.SecretsManager({ apiVersion: `2017-10-17`, region });
const stepFunctions = new AWS.StepFunctions({ apiVersion: `2016-11-23` });
const athena = new AWS.Athena({ apiVersion: `2017-05-18` });
const sesv2 = new AWS.SESV2({ apiVersion: `2019-09-27`, region });

export const dynamoDBCall = (action: string, params: any) => {
  // @ts-ignore
  return docClient[action](params).promise();
};

/**
 * See https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SecretsManager.html#getSecretValue-property
 * @param {GetSecretValueRequest} params {
 *     SecretId: string,
 *     VersionStage: string
 * }
 * @return {Promise}
 * **/
export const getSecret = (params: GetSecretValueRequest) => {
  return sm.getSecretValue(params).promise();
};

/**
 * See https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
 * @param {PutObjectRequest} params {
 *     Body: string,
 *     Bucket: string,
 *     Key: string,
 *     Tagging: string,
 * }
 * @return {Promise}
 * **/
export const putObject = (params: PutObjectRequest) => {
  return s3.putObject(params).promise();
};

/**
 * See https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
 * @param {GetObjectRequest} params {
 *     Bucket: string,
 *     Key: string,
 * }
 * @return {Promise}
 * **/
export const getObject = (params: GetObjectRequest) => {
  return s3.getObject(params).promise();
};

/**
 * See https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#copyObject-property
 * @param {CopyObjectRequest} params {
 *     Bucket: string,
 *     Key: string,
 *     CopySource: string
 * }
 * @return {Promise}
 * **/
export const copyObject = (params: CopyObjectRequest) => {
  return s3.copyObject(params).promise();
};

/**
 * See https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjectsV2-property
 * @param {ListObjectsV2Request} params {
 *     Bucket: string,
 *     Prefix: string,
 *     ContinuationToken: string
 * }
 * @return {Promise}
 * **/
export const listObjectsV2 = (params: ListObjectsV2Request) => {
  return s3.listObjectsV2(params).promise();
};

/**
 * See https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObjectTagging-property
 * @param {GetObjectTaggingRequest} params {
 *     Bucket: string,
 *     Key: string,
 * }
 * @return {Promise}
 * **/
export const getObjectTagging = (params: GetObjectTaggingRequest) => {
  return s3.getObjectTagging(params).promise();
};

/**
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#publish-property
 * @param {PublishInput} params
 * @return {Promise}
 * **/
export const snsPublishMessage = async (params: PublishInput) => {
  return sns.publish(params).promise();
};

/**
 * @param {GetItemInput} params {
 *     TableName: string,
 *     Key: JSON Object with table column name as key
 * }
 * @return {Promise}
 * **/
export const queryTable = async (params: GetItemInput) => {
  return docClient.get(params).promise().then((data) => {
    if (!Object.keys(data).length) {
      throw new Error(`Data not available in the table`);
    }
    return data.Item;
  });
};

/**
 * @param {Object} {
 * event: {JSONObject}
 * logger: {Object} instance of module-winston-logger,
 * functionName: string
 * }
 * @return {Promise}
 * **/
export const invokeLambdaAsync = ({
                                    event,
                                    logger,
                                    functionName
                                  }: { event: any, logger: any, functionName: string }) => {
  return new Promise<void>((resolve, reject) => {
    const lambdaParams = {
      FunctionName: functionName,
      InvocationType: `Event`,
      Payload: JSON.stringify(event)
    };
    logger.debug(`LambdaParams`, lambdaParams);
    new AWS.Lambda().invoke(lambdaParams, (error, data) => {
      if (error) {
        logger.warn(`Error invoking lambda: ${lambdaParams.FunctionName}`, error);
        reject(error);
      } else {
        logger.debug(`Invoked lambda asynchronously: ${lambdaParams.FunctionName}`, data);
        resolve();
      }
    });
  });
};

/**
 * queryStringParameters for Flow and NextState indicate which
 * State to call. requestTimeEpoch set to N to prevent
 * retry logic
 * @param {Object} {
 * event: {JSONObject}, //
 * logger: {Object}, //instance of module-winston-logger,
 * functionName: string // name of the function to invoke
 * }
 * @return {Promise}
 * **/
export const invokeLambdaSync = ({
                                   event,
                                   logger,
                                   functionName
                                 }: { event: any, logger: any, functionName: string }) => {
  return new Promise((resolve, reject) => {
    const lambdaParams = {
      FunctionName: functionName,
      Payload: JSON.stringify(event)
    };
    logger.debug(`LambdaParams`, lambdaParams);
    new AWS.Lambda().invoke(lambdaParams, (error, data) => {
      if (error) {
        logger.warn(`Error invoking lambda: ${lambdaParams.FunctionName}`, error);
        reject(error);
      } else {
        logger.debug(`Lambda Response: ${lambdaParams.FunctionName}`, data);
        if (!data.Payload) {
          reject(new Error(`Lambda did not return a payload.`));
        } else {
          try {
            const payload = JSON.parse(data.Payload as string);
            if (payload.errorMessage) {
              let errorMessage = payload.errorMessage;
              try {
                errorMessage = JSON.parse(errorMessage);
              } catch (error) {
                // swallow JSON.parse() error
              }
              reject(errorMessage);
            } else {
              const response = JSON.parse(payload.body);
              resolve(response);
            }
          } catch (error) {
            logger.warn(`Error parsing lambda response`, error);
            reject(error);
          }
        }
      }
    });
  });
};

export const paginatedScan = async ({
                                      event,
                                      logger,
                                      functionName
                                    }: { event: any, logger: any, functionName: string }) => {
  const response: any = await invokeLambdaSync({
    event,
    logger,
    functionName
  });
  if (response.error) {
    throw new Error(response.error.message);
  } else if (!response.Items || !Array.isArray(response.Items)) {
    logger.error(`paginatedScan() Error`, `No Items returned or Items not an array`);
    return [];
  } else {
    if (!response.LastEvaluatedKey) {
      return response.Items;
    } else {
      const body = JSON.parse(event.body);
      body.LastEvaluatedKey = response.LastEvaluatedKey;
      event.body = JSON.stringify(body);
      const items = await paginatedScan({ event, logger, functionName });
      response.Items.push(...items);
      return response.Items;
    }
  }
};

/**
 * Sets counters used to determine if menu should be regenerated
 * @param  {PutObjectRequest} params
 * @return {{writeStream: module:stream.internal.PassThrough, promise: Promise<ManagedUpload.SendData>}} response
 **/
export const uploadStream = (params: PutObjectRequest) => {
  const pass = new stream.PassThrough();
  params.Body = pass;
  return {
    writeStream: pass,
    promise: s3.upload(params).promise()
  };
};

/**
 * @params {
 * logger: object,
 * phoneNumber: string,
 * ISOCode: string, //optional
 * countryCode: string //optional
 * }
 * @return {object}
 **/
export const getPinpointData = async ({
                                        logger,
                                        phoneNumber,
                                        IsoCode = `US`,
                                        countryCode = `1`
                                      }: {
  logger: any,
  phoneNumber: string,
  IsoCode?: string,
  countryCode?: string
}) => {
  if (!phoneNumber) {
    return { NumberValidateResponse: { PhoneType: `INVALIDTYPE` } };
  }

  const PhoneNumber = countryCode + phoneNumber.slice(-10);

  try {
    return await pinpoint.phoneNumberValidate({
      NumberValidateRequest: {
        IsoCountryCode: IsoCode,
        PhoneNumber
      }
    }).promise();
  } catch (error) {
    logger.warn(`AWS Pinpoint Error`, error);
    throw error;
  }
};

/**
 * @param {SendMessageRequest} params
 * @return {Promise}
 * **/
export const sqsSendMessage = ({ params }: { params: SendMessageRequest }) => {
  return sqs.sendMessage(params).promise();
};

/**
 * @param {DeleteMessageRequest} params
 * @return {Promise}
 * **/
export const sqsDeleteMessage = ({ params }: { params: DeleteMessageRequest }) => {
  return sqs.deleteMessage(params).promise();
};

/**
 * @param {Object} payload
 * @param {Object} logger
 * @param {Number?} requestedDelay - default 30
 * @param {String} queueUrl
 * @param {String?} messageGroupId - for FIFO queues, requestedDelay will be ignored because delay is same for all
 * @return {Promise}
 * **/
export const createQueueAction = async ({
                                          payload,
                                          logger,
                                          requestedDelay = 30,
                                          queueUrl: QueueUrl,
                                          messageGroupId
                                        }: {
  payload: any,
  logger: any,
  requestedDelay?: number,
  queueUrl: string,
  messageGroupId?: string
}) => {
  if (!payload || !QueueUrl) {
    throw new Error(`payload and queueUrl are required`);
  }
  const maxDelayTime = 900;
  let DelaySeconds = requestedDelay;
  if (Number(requestedDelay) > maxDelayTime) {
    DelaySeconds = maxDelayTime;
  }
  const MessageBody = JSON.stringify(payload);
  const MessageAttributes = {
    requestedDelay: {
      DataType: `String`,
      StringValue: requestedDelay.toString()
    }
  };

  const params: SendMessageRequest = {
    QueueUrl,
    MessageBody,
    MessageAttributes,
    DelaySeconds
  };
  if (messageGroupId) {
    delete params.DelaySeconds;
    params.MessageGroupId = messageGroupId;
  }
  logger.debug(`AWSServices.sqsSendMessage() params`, params);
  try {
    const response = await sqsSendMessage({ params });
    logger.debug(`AWSServices.sqsSendMessage() response`, response);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/StepFunctions.html#startExecution-property
 * @param {StartExecutionInput} params
 * @return {Promise<StartExecutionOutput>} output
 * **/
export const startStepFunction = (params: StartExecutionInput) => {
  return stepFunctions.startExecution(params).promise();
};

/**
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Athena.html#startQueryExecution-property
 * @param {StartQueryExecutionInput} params
 * @return {Promise<StartQueryExecutionOutput>} output
 * **/
export const athenaStartQueryExecution = (params: StartQueryExecutionInput) => {
  return athena.startQueryExecution(params).promise();
};

/**
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Athena.html#stopQueryExecution-property
 * @param {StopQueryExecutionInput} params
 * @return {Promise<StopQueryExecutionOutput>} output
 * **/
export const athenaStopQueryExecution = (params: StopQueryExecutionInput) => {
  return athena.stopQueryExecution(params).promise();
};

/**
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Athena.html#getQueryExecution-property
 * @param {GetQueryExecutionInput} params
 * @return {Promise<GetQueryExecutionOutput>} output
 * **/
export const athenaGetQueryExecution = (params: GetQueryExecutionInput) => {
  return athena.getQueryExecution(params).promise();
};

/**
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SES.html#sendRawEmail-property
 * @param {SendEmailRequest} params
 * @return {Promise<SendEmailResponse>} output
 * **/
export const sendEmail = (params: SendEmailRequest) => {
  return sesv2.sendEmail(params).promise();
};
