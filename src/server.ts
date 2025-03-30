import app from "./app";
import { OrderConsumer } from "./queue/OrderConsumer";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  OrderConsumer.start().catch((error) => {
    console.error("Error starting OrderConsumer:", error);
  });
});
