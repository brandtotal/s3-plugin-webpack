export function updateCloudFront(cloudFrontId, originPathToChange, accessKeyId, secretAccessKey) {
    const AWS = require('aws-sdk');
    var cloudfront = new AWS.CloudFront();

    if (accessKeyId && secretAccessKey)
        cloudfront.config.update({ accessKeyId, secretAccessKey })

    function getDistribution(params) {
        return new Promise(function(res, rej) {
            cloudfront.getDistribution(params, function(err, data) {
                if (err) {
                    rej(err);
                    console.log(err, err.stack); // an error occurred
                } else {
                    res(data);
                    console.log(data); // successful response
                }
            });
        })
    }

    function updateDistribution(params) {
        return new Promise(function(res, rej) {
            cloudfront.updateDistribution(params, function(err, data) {
                if (err) {
                    rej(err);
                    console.log(err, err.stack); // an error occurred
                } else {
                    res(data);
                    console.log(data); // successful response
                }
            });
        })
    }


    function setNewOriginPath(params, newOriginPath) {
        return getDistribution(params).then(function(data) {
            console.log(`Current data is ${data} ETag is ${data.ETag}`);
            const DistributionConfig = data["Distribution"]["DistributionConfig"];
            const Origins = DistributionConfig["Origins"];
            const ItemsLen = Origins.Quantity;
            const Items = Origins.Items;
            if (ItemsLen != 1) {
                console.error(`There should be exactly one item here! there are ${ItemsLen}`)
                return;
            }
            const item = Items[0];
            const originalOriginPath = item.OriginPath;
            item.OriginPath = newOriginPath;
            console.info(`About to change path ${originalOriginPath} to ${newOriginPath}`);
            return updateDistribution({ DistributionConfig: DistributionConfig, Id: params.Id, IfMatch: data.ETag });
        })
    }



    return setNewOriginPath({
            Id: cloudFrontId /* required */
        }, originPathToChange)
        .then(function(data) { console.info(`Success!\n${data}`) })
        .catch(function(err) { console.error(err) })
}