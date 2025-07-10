import crypto from "crypto";

export const isValidRazorpaySignature = (
  orderId,
  paymentId,
  signature,
  secret
) => {
  const sign = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(sign)
    .digest("hex");

  return expectedSignature === signature;
};
