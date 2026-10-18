module.exports = async (kernel) => {
  return {
    run: [
      {
        method: "shell.run",
        params: {
          message: "rm -rf node_modules package-lock.json"
        }
      }
    ]
  }
}
