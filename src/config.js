export default  {
    MONGO_HOST: process.env.MONGO_HOST || "localhost",
    MONGO_PORT: process.env.MONGO_PORT || 12721,
    S3_HOST : process.env.S3_HOST || "localhost",
    S3_PORT : process.env.S3_PORT || 9000,
    CONTAINER_VNC_PORT: 5945,
    CONTAINER_IOCORE_PORT: 4567,
    CONTAINER_VIDEO_ANALYZER_PORT: 3000,
    CONTAINER_DEV_CUSTOM_PORT: 5943
}
