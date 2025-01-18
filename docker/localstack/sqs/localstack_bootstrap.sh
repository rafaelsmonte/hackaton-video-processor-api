#!/usr/bin/env bash
set -euo pipefail
 
# enable debug
# set -x
 
LOCALSTACK_HOST=localhost
AWS_REGION=us-east-1

echo "configuring sqs"
echo "==================="
 
# https://docs.aws.amazon.com/cli/latest/reference/sqs/create-queue.html
create_queue() {
  local QUEUE_NAME_TO_CREATE=$1
  awslocal sqs create-queue --endpoint-url http://localhost:4566 --queue-name --region ${AWS_REGION} ${QUEUE_NAME_TO_CREATE} --attributes "FifoQueue=true,ContentBasedDeduplication=true" 
}
 
create_queue "video-api-queue.fifo"

echo "configuring sns"
echo "==================="

# https://docs.aws.amazon.com/cli/latest/reference/sns/create-topic.html
create_sns_topic() {
  local TOPIC_NAME_TO_CREATE=$1
  
  # CREATE SNS TOPIC
  # https://docs.aws.amazon.com/cli/latest/reference/sns/create-topic.html
  SNS_TOPIC_ARN=$(awslocal sns create-topic --endpoint-url http://${LOCALSTACK_HOST}:4566 --name "${TOPIC_NAME_TO_CREATE}" --region ${AWS_REGION} --attributes "FifoTopic=true,ContentBasedDeduplication=true" --query "TopicArn" --output text)
  echo "SNS Topic ARN: ${SNS_TOPIC_ARN}"
}

create_sns_topic "video-api-topic.fifo"

echo "Configuring DynamoDB"
echo "==================="

# https://docs.aws.amazon.com/cli/latest/reference/dynamodb/create-table.html
create_table() {
  local TABLE_NAME=$1
  awslocal dynamodb create-table \
    --endpoint-url http://${LOCALSTACK_HOST}:4566 \
    --region ${AWS_REGION} \
    --table-name ${TABLE_NAME} \
    --attribute-definitions \
      AttributeName=id,AttributeType=S \
    --key-schema \
      AttributeName=id,KeyType=HASH \
    --provisioned-throughput \
      ReadCapacityUnits=5,WriteCapacityUnits=5
}

create_table "videos"

# CREATE S3 BUCKET
create_bucket() {
  local BUCKET_NAME=$1
  awslocal s3 mb s3://${BUCKET_NAME} \
    --endpoint-url http://${LOCALSTACK_HOST}:4566 \
    --region ${AWS_REGION}
}

create_bucket "video-bucket"