console.log("Loading function");
const AWS = require('aws-sdk')

exports.handler = async (event, context, callback) => {
    var newSNS = new AWS.SNS();
    if (event.action === "pns_sendmsg") {
        try {
            const sendCount = event.messages.length;
            for (var i = 0; i < sendCount; i++) {
                const myPayload = JSON.stringify({
                    default: "default",
                    GCM: JSON.stringify({
                      notification: {
                          title: event.messages[i].title,
                          body: event.messages[i].body,
                          sound: "default"
                      }  
                    })
                })
                const myTarget = event.messages[i].target;
                const snsParams = {
                    Message: myPayload,
                    TargetArn: myTarget,
                    MessageStructure: "json"
                }
                await newSNS.publish(snsParams).promise();
            }
            return {
                statusCode: 200,
                body: "push notification done"
            }
            
        } catch (e) {
            console.log("err:", e)
            return {
                statusCode: 500,
                body: "got some error when push notification"
            }
        }
        
    } else if (event.action === "pns_reg"){
        try {
            let deviceCount = event.devices.length;
            const arrARN = []
            for (var i = 0; i < deviceCount; i++) {
                const myToken = event.devices[i].token;
                const snsParams = {
                    PlatformApplicationArn:event.targetPlatform,
                    Token:myToken
                };
                let result = await newSNS.createPlatformEndpoint(snsParams).promise();
                arrARN.push(result.EndpointArn)
            }
            return {
                statusCode: 200,
                body: "device register to push notification service done",
                arnList: arrARN
            }
        } catch (e) {
            console.log("err:", e)
            return {
                statusCode: 500,
                body: "got some error when device register push notification service"
            }
        }
        
    }
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
