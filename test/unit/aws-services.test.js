/* eslint-disable no-console */
const expect = require(`chai`).expect;
const sinon = require(`sinon`);
const rewire = require(`rewire`);
process.env.LOCAL_CLI = `1`;
require(`../../lib/aws-services`);
process.env.LOCAL_CLI = `0`;
const awsServices = rewire(`../../lib/aws-services`);
const Logger = require(`@mawhea/module-winston-logger`);
const logger = new Logger({});
const loggerDebugSpy = sinon.spy(logger, `debug`);
const loggerWarnSpy = sinon.spy(logger, `warn`);
let stubPromise;
const SQS_BASE_URL = `https://sqs.\${AWS::Region}.amazonaws.com/\${AWS::AcountId}/\${applicationPrefix}-queue-`;
const queueName = `test`;
const queueUrl = `${SQS_BASE_URL}${queueName}`;

describe(`AWS Services Unit Tests`, () => {
   describe(`S3 Tests`, () => {
      beforeEach(() => {
         stubPromise = Promise.resolve(`Success`);
      });
      const putObject = {
         promise: () => {
            return stubPromise;
         }
      };
      const upload = {
         promise: () => {
            return stubPromise;
         }
      };
      const getObjectTagging = {
         promise: () => {
            return stubPromise;
         }
      };
      const listObjectsV2 = {
         promise: () => {
            return stubPromise;
         }
      };
      const copyObject = {
         promise: () => {
            return stubPromise;
         }
      };
      const getObject = {
         promise: () => {
            return stubPromise;
         }
      };
      const stubbedS3 = {
         putObject: (params) => {
            return putObject;
         },
         upload: (params) => {
            return upload;
         },
         getObject: (params) => {
            return getObject;
         },
         getObjectTagging: (params) => {
            return getObjectTagging;
         },
         listObjectsV2: (params) => {
            return listObjectsV2;
         },
         copyObject: (params) => {
            return copyObject;
         }
      };

      awsServices.__set__(`s3`, stubbedS3);

      it(`should put object with params passed`, () => {
         awsServices.putObject({ foo: `bar` }).then((data) => {
            expect(data.toString()).to.be.equal(`Success`);
         }).catch((err) => {
            console.log(err);
         });
      });
      it(`should reject if putObject rejects`, () => {
         stubPromise = Promise.reject(new Error(`Error Putting Object`));
         awsServices.putObject({ foo: `bar` }).then((data) => {
            expect(data).to.be.undefined;
         }).catch((err) => {
            expect(err.message).to.be.equal(`Error Putting Object`);
         });
      });

      it(`should uploadStream object with params passed`, () => {
         const res = awsServices.uploadStream({ foo: `bar` });
         expect(res.writeStream).exist;
         res.promise.then((data) => {
            expect(data.toString()).to.be.equal(`Success`);
         }).catch((err) => {
            console.log(err);
         });
      });
      it(`should uploadStream object with params passed`, () => {
         stubPromise = Promise.reject(new Error(`Error upload Object`));
         const res = awsServices.uploadStream({ foo: `bar` });
         expect(res.writeStream).exist;
         res.promise.then((data) => {
         }).catch((err) => {
            expect(err.message).to.be.equal(`Error upload Object`);
         });
      });

      it(`should getObject with params passed`, () => {
         return awsServices.getObject({ foo: `bar` }).then((data) => {
            expect(data.toString()).to.be.equal(`Success`);
         });
      });
      it(`should reject if putObject rejects`, () => {
         stubPromise = Promise.reject(new Error(`Error Getting Object`));
         return awsServices.putObject({ foo: `bar` }).catch((err) => {
            expect(err.message).to.be.equal(`Error Getting Object`);
         });
      });

      it(`should copyObject with params passed`, () => {
         return awsServices.copyObject({ foo: `bar` }).then((data) => {
            expect(data.toString()).to.be.equal(`Success`);
         });
      });
      it(`should reject if copyObject rejects`, () => {
         stubPromise = Promise.reject(new Error(`Error Copying Object`));
         return awsServices.copyObject({ foo: `bar` }).catch((err) => {
            expect(err.message).to.be.equal(`Error Copying Object`);
         });
      });

      it(`should listObjectsV2 with params passed`, () => {
         return awsServices.listObjectsV2({ foo: `bar` }).then((data) => {
            expect(data.toString()).to.be.equal(`Success`);
         });
      });
      it(`should reject if listObjectsV2 rejects`, () => {
         stubPromise = Promise.reject(new Error(`Error Listing Objects`));
         return awsServices.listObjectsV2({ foo: `bar` }).catch((err) => {
            expect(err.message).to.be.equal(`Error Listing Objects`);
         });
      });

      it(`should getObjectTagging with params passed`, () => {
         return awsServices.getObjectTagging({ foo: `bar` }).then((data) => {
            expect(data.toString()).to.be.equal(`Success`);
         });
      });
      it(`should reject if getObjectTagging rejects`, () => {
         stubPromise = Promise.reject(new Error(`Error Getting Object Tagging`));
         return awsServices.getObjectTagging({ foo: `bar` }).catch((err) => {
            expect(err.message).to.be.equal(`Error Getting Object Tagging`);
         });
      });
   });

   describe(`SNS Tests`, () => {
      let stubPromise = Promise.resolve(`Success`);
      const publish = {
         promise: () => {
            return stubPromise;
         }
      };
      const stubbedNSN = {
         publish: (params) => {
            return publish;
         }
      };

      awsServices.__set__(`sns`, stubbedNSN);

      it(`should publish a message with params passed`, () => {
         awsServices.snsPublishMessage({ foo: `bar` }).then((data) => {
            expect(data.toString()).to.be.equal(`Success`);
         }).catch((err) => {
            console.log(err);
         });
      });

      it(`should reject if publish rejects`, () => {
         stubPromise = Promise.reject(new Error(`Error Publishing Message`));
         awsServices.snsPublishMessage({ foo: `bar` }).then((data) => {
            expect(data).to.be.undefined;
         }).catch((err) => {
            expect(err.message).to.be.equal(`Error Publishing Message`);
         });
      });
   });

   describe(`DynamoDB Tests`, () => {
      let stubPromise;
      beforeEach(() => {
         stubPromise = Promise.resolve(`Success`);
      });
      const stubGet = {
         promise: () => {
            return stubPromise;
         }
      };
      const stubDocClient = {
         get: (params) => {
            return stubGet;
         }
      };

      awsServices.__set__(`docClient`, stubDocClient);

      it(`should call the action specified on the DocumentClient`, () => {
         awsServices.dynamoDBCall(`get`, {}).then((data) => {
            expect(data).to.equal(`Success`);
         });
      });

      it(`should handle DocumentClient Error`, () => {
         stubPromise = Promise.reject(new Error(`Stubbed Doc Client Error`));
         awsServices.queryTable({}).then((data) => {
            console.log(data);
            expect(data).to.be.undefined;
         }).catch((err) => {
            expect(err.message).to.be.equal(`Stubbed Doc Client Error`);
         });
      });

      it(`should return error if empty result`, () => {
         stubPromise = Promise.resolve({});
         awsServices.queryTable({}).then((data) => {
            expect(data).to.be.undefined;
         }).catch((err) => {
            expect(err.Error).to.be.equal(`Data not available in the table`);
         });
      });

      it(`should resolve with the item from DynamoDB`, () => {
         stubPromise = Promise.resolve({
            Item:
               {
                  key1: `value1`,
                  key2: `value2`,
                  keyNest1: {
                     nestedKey1: `nestedValue1`,
                     nestedKey2: `nestedValue2`
                  },
                  keyNest2: {
                     nestedKey1: `nested2Value1`,
                     nestedKey2: `nested2Value2`
                  }
               }
         });
         awsServices.queryTable().then((data) => {
            expect(data.key1).to.be.equal(`value1`);
            expect(data.keyNest1.nestedKey1).to.be.equal(`nestedValue1`);
         }).catch((err) => {
            expect(err).to.be.undefined;
         });
      });
   });

   describe(`Lambda Tests`, () => {
      const stubInvoke = sinon.stub();
      const StubAWS = function() {
      };
      const Lambda = function() {
         this.invoke = stubInvoke;
      };
      StubAWS.Lambda = Lambda;
      const revertAWS = awsServices.__set__(`AWS`, StubAWS);

      beforeEach(() => {
         stubInvoke.resetHistory();
         loggerDebugSpy.resetHistory();
         loggerWarnSpy.resetHistory();
      });

      describe(`Lambda Async Tests`, () => {
         it(`should invoke a lambda async`, () => {
            stubInvoke.yields(null, `Successfully Invoked`);
            awsServices.invokeLambdaAsync({ event: { requestContext: {} }, logger, functionName: `foobar` })
               .then(() => {
                  expect(stubInvoke.args[0].Invocationtype).to.be.equal(`Event`);
                  expect(loggerDebugSpy.called).to.be.true;
                  expect(loggerDebugSpy.getCalls()[1].args[1]).to.be.equal(`Successfully Invoked`);
               }).catch((err) => {
                  console.log(err);
               });
         });

         it(`should reject if lambda invoke callback has error`, () => {
            stubInvoke.yields({ message: `Async Failed` }, null);
            awsServices.invokeLambdaAsync({ event: { requestContext: {} }, logger, functionName: `foobar` })
               .catch((err) => {
                  expect(loggerDebugSpy.called).to.be.true;
                  expect(loggerWarnSpy.called).to.be.true;
                  expect(err.message).to.be.equal(`Async Failed`);
               });
         });
      });
      describe(`Lambda Tests`, () => {
         it(`should invoke a lambda and reject if no payload`, () => {
            stubInvoke.yields(null, `Successfully Invoked`);
            awsServices.invokeLambdaSync({
               event: { requestContext: {} },
               logger, functionName: `foobar`
            }).then((data) => {
               expect(stubInvoke.args[0].Invocationtype).to.be.undefined;
               expect(loggerDebugSpy.called).to.be.true;
               expect(loggerDebugSpy.getCalls()[1].args[1]).to.be.equal(`Successfully Invoked`);
            }).catch((err) => {
               expect(err.message).to.be.equal(`Lambda did not return a payload.`);
            });
         });

         it(`should invoke lambda and return body if no errorMessage in payload`, () => {
            const payload = JSON.stringify({ body: JSON.stringify({ result: `Successful Sync Invoke` }) });
            stubInvoke.yields(null, { Payload: payload });
            awsServices.invokeLambdaSync({
               event: { requestContext: {} },
               logger, functionName: `foobar`
            }).then((data) => {
               expect(stubInvoke.args[0].Invocationtype).to.be.undefined;
               expect(loggerDebugSpy.called).to.be.true;
               expect(data.result).to.be.equal(`Successful Sync Invoke`);
            }).catch((err) => {
               console.log(err.message).to.be.equal(`Lambda did not return a payload`);
            });
         });

         it(`should reject if it fails to parse the payload`, () => {
            const payload = JSON.stringify({ body: { result: `Successful Sync Invoke` } });
            stubInvoke.yields(null, { Payload: payload });
            awsServices.invokeLambdaSync({
               event: { requestContext: {} },
               logger, functionName: `foobar`
            }).catch((err) => {
               expect(loggerWarnSpy.called).to.be.true;
               expect(loggerWarnSpy.getCalls()[0].args[0]).to.be.equal(`Error parsing lambda response`);
               expect(err).to.not.be.undefined;
            });
         });

         it(`should reject if errorMessage in payload`, () => {
            const payload = JSON.stringify({
               errorMessage: JSON.stringify({
                  errorMessage: `Error From Invoked Lambda`
               })
            });
            stubInvoke.yields(null, { Payload: payload });
            awsServices.invokeLambdaSync({
               event: { requestContext: {} },
               logger,
               functionName: `foobar`
            }).catch((err) => {
               expect(loggerWarnSpy.called).to.be.false;
               expect(err.errorMessage).to.be.equal(`Error From Invoked Lambda`);
            });
         });

         it(`should reject if lambda invoke callback has error`, () => {
            stubInvoke.yields({ message: `Sync Failed` }, null);
            awsServices.invokeLambdaSync({
               event: { requestContext: {} },
               logger, functionName: `foobar`
            }).catch((err) => {
               expect(loggerDebugSpy.called).to.be.true;
               expect(loggerWarnSpy.called).to.be.true;
               expect(err.message).to.be.equal(`Sync Failed`);
            });
         });
      });

      after(() => {
         revertAWS();
      });
   });

   describe(`Pinpoint Tests`, () => {
      const validatedResponse = {
         NumberValidateResponse: {
            Carrier: `Verizon Wireless`,
            City: `Nashville`,
            CleansedPhoneNumberE164: `+16154106598`,
            CleansedPhoneNumberNational: `6154106598`,
            Country: `United States`,
            CountryCodeIso2: `US`,
            CountryCodeNumeric: `1`,
            OriginalCountryCodeIso2: `US`,
            OriginalPhoneNumber: `+16154106598`,
            PhoneType: `MOBILE`,
            PhoneTypeCode: 0
         }
      };

      let stubPromise = Promise.resolve(validatedResponse);

      const phoneNumberValidate = {
         promise: () => {
            return stubPromise;
         }
      };

      const stubbedPinpoint = {
         phoneNumberValidate: () => {
            return phoneNumberValidate;
         }
      };

      awsServices.__set__(`pinpoint`, stubbedPinpoint);

      it(`should return a NumberValidateResponse object`, async function() {
         const data = await awsServices.getPinpointData({ logger, phoneNumber: `6154106598` });
         expect(data).to.be.equal(validatedResponse);
      });

      it(`should return an error if pinpoint fails`, async function() {
         stubPromise = Promise.reject(new Error(`Pinpoint Error`));

         try {
            await awsServices.getPinpointData({ logger, phoneNumber: `6154106598` });
         } catch (error) {
            expect(error.message).to.be.equal(`Pinpoint Error`);
         }
      });
      it(`should return NumberValidateResponse as INVALIDTYPE`, async function() {
         try {
            const data = await awsServices.getPinpointData({ logger });
            expect(data.NumberValidateResponse.PhoneType).to.be.equal(`INVALIDTYPE`);
         } catch (error) {
            expect(error.message).to.be.undefined;
         }
      });
   });

   describe(`SQS Tests`, () => {
      const chainedPromise = {
         promise: () => {
            return stubPromise;
         }
      };
      const stubbedSQS = sinon.stub();
      stubbedSQS.sendMessage = sinon.stub();
      stubbedSQS.deleteMessage = sinon.stub();
      awsServices.__set__(`sqs`, stubbedSQS);

      beforeEach(() => {
         stubPromise = Promise.resolve(`Success`);
         stubbedSQS.sendMessage.reset();
         stubbedSQS.sendMessage.returns(chainedPromise);
         stubbedSQS.deleteMessage.reset();
         stubbedSQS.deleteMessage.returns(chainedPromise);
      });

      describe(`sqsSendMessage()`, function() {
         it(`should send sqs message with params passed`, () => {
            awsServices.sqsSendMessage({ foo: `bar` }).then((data) => {
               expect(data.toString()).to.be.equal(`Success`);
            }).catch((err) => {
               console.log(err);
            });
         });
         it(`should reject if sendMessage rejects`, () => {
            stubPromise = Promise.reject(new Error(`Error Sending Message`));
            awsServices.sqsSendMessage({ foo: `bar` }).then((data) => {
               expect(data).to.be.undefined;
            }).catch((err) => {
               expect(err.message).to.be.equal(`Error Sending Message`);
            });
         });
      });

      describe(`sqsDeleteMessage()`, function() {
         it(`should delete sqs message with params passed`, () => {
            awsServices.sqsDeleteMessage({ foo: `bar` }).then((data) => {
               expect(data.toString()).to.be.equal(`Success`);
            }).catch((err) => {
               console.log(err);
            });
         });
         it(`should reject if deleteMessage rejects`, () => {
            stubPromise = Promise.reject(new Error(`Error Deleting Message`));
            awsServices.sqsDeleteMessage({ foo: `bar` }).then((data) => {
               expect(data).to.be.undefined;
            }).catch((err) => {
               expect(err.message).to.be.equal(`Error Deleting Message`);
            });
         });
      });

      describe(`createQueueAction()`, function() {
         beforeEach(function() {
            loggerDebugSpy.resetHistory();
            loggerWarnSpy.resetHistory();
         });

         it(`should call sqsSendMessage() with specified requestedDelay`, function() {
            return awsServices.createQueueAction({
               payload: {},
               queueUrl,
               logger,
               requestedDelay: 35
            }).then(() => {
               expect(loggerDebugSpy.getCalls()[0].args[1].DelaySeconds).to.be.equal(35);
               expect(stubbedSQS.sendMessage.called).to.be.true;
               expect(stubbedSQS.sendMessage.getCalls().length).to.equal(1);
            });
         });
         it(`should call sqsSendMessage() with maxDelayTime of 900`, function() {
            return awsServices.createQueueAction({
               payload: {},
               queueUrl,
               logger,
               requestedDelay: 1000
            }).then(() => {
               expect(loggerDebugSpy.getCalls()[0].args[1].DelaySeconds).to.be.equal(900);
               expect(stubbedSQS.sendMessage.called).to.be.true;
               expect(stubbedSQS.sendMessage.getCalls().length).to.equal(1);
            });
         });
         it(`should throw an error if required params are not provided`, function() {
            return awsServices.createQueueAction({
               logger,
               requestedDelay: 35
            }).catch((err) => {
               expect(err.message).to.be.equal(`payload and queueUrl are required`);
            });
         });
         it(`should throw an error from AWSServices.sqsSendMessage()`, function() {
            stubPromise = Promise.reject(new Error(`Stub Error`));
            return awsServices.createQueueAction({
               logger,
               payload: {},
               queueUrl
            }).catch((err) => {
               expect(err.message).to.be.equal(`Stub Error`);
            });
         });
      });
   });

   describe(`Secret Manager Tests`, () => {
      beforeEach(() => {
         stubPromise = Promise.resolve(`Success`);
      });
      const stubbedSM = {
         getSecretValue: (params) => {
            return {
               promise: () => stubPromise
            };
         }
      };

      awsServices.__set__(`sm`, stubbedSM);

      it(`should send get Secret params passed`, () => {
         awsServices.getSecret({ foo: `bar` }).then((data) => {
            expect(data.toString()).to.be.equal(`Success`);
         }).catch((err) => {
            console.log(err);
         });
      });
      it(`should reject if getSecret rejects`, () => {
         stubPromise = Promise.reject(new Error(`Error Sending Message`));
         awsServices.getSecret({ foo: `bar` }).then((data) => {
            expect(data).to.be.undefined;
         }).catch((err) => {
            expect(err.message).to.be.equal(`Error Sending Message`);
         });
      });
   });

   describe(`Step Function Tests`, () => {
      const chainedPromise = {
         promise: () => {
            return stubPromise;
         }
      };
      const stubbedStepFunctions = sinon.stub();
      stubbedStepFunctions.startExecution = sinon.stub();
      awsServices.__set__(`stepFunctions`, stubbedStepFunctions);
      beforeEach(() => {
         stubPromise = Promise.resolve(`Success`);
         stubbedStepFunctions.startExecution.reset();
         stubbedStepFunctions.startExecution.returns(chainedPromise);
      });
      it(`should call stepFunctions.startExecution() with specified parameters`, () => {
         awsServices.startStepFunction({ foo: `bar` }).then((data) => {
            expect(data.toString()).to.be.equal(`Success`);
         });
      });
      it(`should reject if getSecret rejects`, () => {
         stubPromise = Promise.reject(new Error(`Stubbed Error`));
         awsServices.startStepFunction({ foo: `bar` }).then((data) => {
            expect(data).to.be.undefined;
         }).catch((err) => {
            expect(err.message).to.be.equal(`Stubbed Error`);
         });
      });
   });
});
