const compress_images = require("compress-images");
const CompressImage = async (fromUrl, toUrl) => {
    compress_images(fromUrl, toUrl, { compress_force: false, statistic: true, autoupdate: true }, false,
        {jpg: {engine: 'mozjpeg', command: ['-quality', '75']}},
        //{webp: {engine: 'webp', command: false}},
        { png: { engine: "pngquant", command: ["--quality=20-50", "-o"] } },
        { svg: { engine: "svgo", command: "--multipass" } },
        { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
        function (error, completed, statistic) {
            // console.log("error",error);
            // console.log("completed",completed);
            // console.log("statistic",statistic);
        }
    );
};
module.exports = CompressImage;