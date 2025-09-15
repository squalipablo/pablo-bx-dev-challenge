function getCommonConfig() {
  return {
    port: parseInt(process.env.PORT ?? process.env.APP_PORT ?? '3000', 10),
  };
}

export default getCommonConfig;
