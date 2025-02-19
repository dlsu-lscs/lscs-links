import mongoose from 'mongoose'

mongoose.connect(process.env.DB_URL)
  .then(() => console.log("[LSCSlinks] Connected to MongoDB Database successfully."))
  .catch((e) => console.error(`[LSCSlinks] Connection to MongoDB Database failed. Error: ${e}`));

export default mongoose;
