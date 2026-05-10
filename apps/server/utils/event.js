export const readClob = (lob) =>
  new Promise((resolve, reject) => {
    let clobData = "";
    lob.setEncoding("utf8");
    lob.on("data", (chunk) => (clobData += chunk));
    lob.on("end", () => resolve(clobData));
    lob.on("error", (err) => reject(err));
  });
