//* This server side function can be imported and used in other modules

//* req, res, are  objects provided by the server framework or library
export default function handler(req, res) {
  // getting the token Id from the parameter:
  const tokenId = req.query.id;
  // Extracting all the images via github:
  const image_url =
    "https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/";

  // The api is sending back metadata for a cryptodev
  // Make our collection compatible with opensea by following some standards:

  //* This is for sending the constructed response back to client
  //* HTTP status code = 200, meaning a successful request
  res.status(200).json({
    name: "Crypto Dev #" + tokenId,
    description: "Crypto Dev is a collection of developers in crypto",
    image: image_url + tokenId + ".svg",
  });
}

//* this code defines a server-side function that handles a request,
//* extracts a token ID from the request query parameters, constructs
//* metadata for a "Crypto Dev" based on the token ID, and sends the metadata
//* back to the client as a JSON response.
