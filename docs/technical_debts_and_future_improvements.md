### **Technical Debts and Future Improvements**

As the API service evolves, there are two key areas for improvement that will enhance reliability and security:

### **1. Ensuring Message Delivery with the Outbox Pattern**

Currently, messages are sent directly to **Amazon SNS** when specific events occur in the system. However, there is no built-in mechanism to guarantee that these messages are successfully published. If a failure occurs during message transmission, there is a risk of **losing critical event notifications**.

To mitigate this risk, the current approach involves a "manual" rollback mechanism. When a new video is created, the system first stores the video record in the database and then attempts to publish a message to SNS. If the message fails to send, the system deletes the video record and returns an error to the client. This ensures that no "orphaned" records remain, preventing inconsistencies between the database and the messaging system.

While this approach guarantees data integrity, it does not ensure eventual message delivery. To improve this, implementing the **Outbox Pattern** would introduce a persistent message storage mechanism\*\*. Instead of sending messages to SNS immediately, events would first be stored in a dedicated database table. A background process would then reliably read and publish these messages to SNS, ensuring that no messages are lost due to temporary failures. This approach enhances fault tolerance, improves message consistency, and allows retry mechanisms for failed message deliveries.

### **2. Protecting S3 URLs and Implementing Secure File Delivery**

The API currently returns direct S3 URLs to clients when listing videos. While this approach simplifies access, it also exposes raw storage links, making it possible for unauthorized users to share or access videos directly without authentication.

A more secure approach would be to hide S3 URLs from the client and introduce a new API endpoint for secure video retrieval. Instead of exposing the S3 link, the API would fetch the video file from S3 and stream it directly to the user. This would allow better access control, as requests could be authenticated and authorized before serving the video. Additionally, signed URLs with expiration could be an alternative for controlled, temporary access.

---

These improvements will strengthen the resilience and security of the API, ensuring **reliable event messaging** and **better control over video access** while maintaining a seamless user experience.
