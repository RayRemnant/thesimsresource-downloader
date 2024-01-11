//TO-DO: delete file versions after upload: https://www.backblaze.com/b2/docs/file_versions.html
//const cloudflare = require("./cloudflare");
/* const backblazeHostCdn = "https://" + process.env.B2_HOST_CDN + "/file/";
const backblazeBucketName = process.env.B2_BUCKET_NAME; */

const B2 = require("backblaze-b2");

const accountId = process.env.B2_KEY_ID;
const masterApplicationKey = process.env.B2_MASTER_KEY;

const bucketId = process.env.B2_BUCKET_ID;

exports.authorize = async () => {
    const b2 = new B2({
        applicationKeyId: accountId, // or accountId: 'accountId'
        applicationKey: masterApplicationKey, // or masterApplicationKey
    });

    await b2.authorize({});

    //console.log(b2);
    return { b2 };
};
/* b2 example
B2 {
  accountId: '<ID>',
  applicationKeyId: '<ID>',
  applicationKey: '<ID>',
  authorizationToken: '<TOKEN>',
  apiUrl: 'https://api003.backblazeb2.com',
  downloadUrl: 'https://f003.backblazeb2.com'
} */

exports.getUploadAuth = async ({ b2 }) => {

    if (!b2) {
        var { b2 } = await this.authorize();
    }

    const [uploadUrl, uploadAuthToken] = await b2
        .getUploadUrl({
            bucketId: bucketId,
        })
        .then((res) => {
            //console.log(res.data);
            return [res.data.uploadUrl, res.data.authorizationToken];
        });

    return { b2, uploadUrl, uploadAuthToken };
};
/* res.data example
{
  authorizationToken: '<TOKEN>',
  bucketId: '<ID>',
  uploadUrl: 'https://<DOMAIN>/b2api/v2/b2_upload_file/...'
} */

exports.upload = async (
    { b2, uploadUrl, uploadAuthToken },
    fileName,
    fileData
) => {
    const uploadInfo = await b2
        .uploadFile({
            uploadUrl: uploadUrl,
            uploadAuthToken: uploadAuthToken,
            fileName: fileName,
            data: fileData,
        })
        .then((res) => {
            //console.log(res.data);
            console.log(fileName + " UPLOAD OK");
            return res.data;
        })
        .catch((err) => {
            console.log(fileName + " UPLOAD FAIL");
            console.log(err);
        });

    await new Promise((r) => setTimeout(r, 500));

    /* cloudflare.purgeCache([
        backblazeHostCdn + backblazeBucketName + "/" + fileName,
    ]); */

    return uploadInfo;
};
/* res.data example
{
  accountId: '<ID>',
  action: 'upload',
  bucketId: '<ID>',
  contentLength: <INT>,
  contentMd5: '<MD5>',
  contentSha1: '<SHA1>',
  contentType: 'image/jpeg' || <IDK>,
  fileId: '<ID>',
  fileInfo: { },
  fileName: '<STRING>',
  uploadTimestamp: <INT>
} */

exports.listFileNames = async (
    { b2 },
    prefix = "",
    delimiter = "",
    maxFileCount = 10000,
    nextFileName = ""
) => {
    if (!b2) {
        var { b2 } = await this.authorize();
    }

    if (delimiter === true) {
        delimiter = "/";
    } else if (!delimiter) {
        delimiter = "";
    }

    let files = [];

    [files, nextFileName] = await b2
        .listFileNames({
            bucketId: bucketId,
            prefix: prefix, //with this you can select a prefix for files or a folder, it will return every file inside it and its subfolders, to avoid files in subfolders add delimiter
            delimiter: delimiter, //select all files matching the prefix up to this character — mostly used to delimit selection in current folder (or root in case of no prefix) by passing "/"
            //see examples here: https://www.backblaze.com/b2/docs/b2_list_file_names.html
            startFileName: nextFileName,
            maxFileCount: maxFileCount,
        })
        .then((res) => {
            //console.log(res.data);
            return [res.data.files, res.data.nextFileName];
        });

    /* for (let { fileName } of files) {
        cloudflare.purgeCache([
            backblazeHostCdn + backblazeBucketName + "/" + fileName,
        ]);
    } */

    if (nextFileName) {
        const { files: nextFiles } = await this.listFileNames(
            { b2 },
            prefix,
            delimiter,
            maxFileCount,
            nextFileName
        );
        files = files.concat(nextFiles);
    }

    return { b2, files };
};

/* res.data example
[
  {
  accountId: '<ID>',
  action: 'upload',
  bucketId: '<ID>',
  contentLength: <INT>,
  contentMd5: '<MD5>',
  contentSha1: '<SHA1>',
  contentType: 'image/jpeg || <IDK>,
  fileId: '<ID>',
  fileInfo: {},
  fileName: '<STRING>',
  uploadTimestamp: <INT>
 }
  {
  accountId: '<ID>',
  action: 'upload',
  bucketId: '<ID>',
  contentLength: <INT>,
  contentMd5: '<MD5>',
  contentSha1: '<SHA1>',
  contentType: 'image/jpeg' || <IDK>,
  fileId: '<ID>',
  fileInfo: {},
  fileName: '<STRING>',
  uploadTimestamp: <INT>
 }
] */

exports.listFileVersions = async (
    { b2 },
    prefix,
    delimiter,
    maxFileCount,
    startFileName,
    startFileId
) => {
    if (!b2) {
        var { b2 } = await this.authorize();
    }

    let files = [];

    [files, nextFileName, nextFileId] = await b2
        .listFileVersions({
            bucketId: bucketId,
            prefix: prefix,
            delimiter: delimiter,
            maxFileCount: maxFileCount,
            startFileName: startFileName,
            startFileId: startFileId,
        })
        .then((res) => {
            //console.log(res.data.files);
            return [res.data.files, res.data.nextFileName, res.data.nextFileId];
        });

    if (nextFileName) {
        const { files: nextFiles } = await this.listFileVersions(
            { b2 },
            prefix,
            delimiter,
            maxFileCount,
            nextFileName,
            nextFileId
        );
        files = files.concat(nextFiles);
    }

    return { b2, files };
};

/* res.data.files example
[
{
  accountId: '<ID>',
  action: 'upload',
  bucketId: '<ID>',
  contentLength: <INT>,
  contentMd5: '<MD5>',
  contentSha1: '<SHA1>',
  contentType: 'image/jpeg' || <IDK>,
  fileId: '<ID>',
  fileInfo: {},
  fileName: '<NAME>',
  uploadTimestamp: <INT>
},
{
  accountId: '<ID>',
  action: 'upload',
  bucketId: '<ID>',
  contentLength: <INT>,
  contentMd5: '<MD5>',
  contentSha1: '<SHA1>',
  contentType: 'image/jpeg' || <IDK>,
  fileId: '<ID>',
  fileInfo: {},
  fileName: '<NAME>',
  uploadTimestamp: <INT>
}
]
...
*/

exports.deleteFileVersion = async (
    b2,
    fileName,
    fileId
) => {
    /* if (!b2) {
    var { b2 } = await authorize();
  } */

    await b2.deleteFileVersion({
        fileName: fileName,
        fileId: fileId,
    });

    console.log("NAME: " + fileName + "   ID: " + fileId + " - DELETE OK");
};

/* */

exports.deleteFile = async ({ b2 }, fileName) => {
    if (!b2) {
        var { b2 } = await this.authorize();
    }

    let { files } = await this.listFileNames({ b2 }, fileName);

    if (!files || files.length < 1) {
        console.log(fileName + " NOT FOUND - DELETE FAIL");
        return;
    }

    for (let file of files) {
        let { files: fileVersions } = await this.listFileVersions(
            b2,
            file.fileName
        );

        //console.log(fileVersions);

        for (let i = 0; i < fileVersions.length; i++) {
            await this.deleteFileVersion(
                b2,
                fileVersions[i].fileName,
                fileVersions[i].fileId
            );
        }

        console.log(file.fileName + " DELETE OK");
    }

    /* cloudflare.purgeCache([
        backblazeHostCdn + backblazeBucketName + "/" + fileName,
    ]); */
};

/* TEST 
(async () => {
  deleteFile(undefined, "product/16x9/case-pc")
})() */

exports.cleanupFileVersion = async (
    { b2 },
    prefix = undefined,
    delimiter = undefined,
    versionKeep = 2
) => {
    if (versionKeep < 1) {
        throw "versionKeep can't be lower than 1";
    }
    if (!b2) {
        var { b2 } = await this.authorize();
    }

    let { files } = await this.listFileNames({ b2 }, prefix, delimiter);

    for (let file of files) {
        let { files: fileVersions } = await this.listFileVersions(
            { b2 },
            file.fileName
        );

        //console.log(fileVersions);

        fileVersions.sort((a, b) =>
            a.uploadTimestamp < b.uploadTimestamp ? 1 : -1
        );

        for (let i = versionKeep; i < fileVersions.length; i++) {
            await deleteFileVersion(
                b2,
                fileVersions[i].fileName,
                fileVersions[i].fileId
            );
        }
    }
};
/* */

/* (async () => {
  try {
    let x = await listFileNames(undefined, 'product/16x9/case-pc-vultech');
console.log(x)
  } catch (err) {
    console.log(err);
  }
})();  */