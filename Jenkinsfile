#!groovy

pipeline {
  agent none
  stages {
    stage('Athena Install and Deploy to AWS ECR Docker host') {
      agent any
      steps {
        sh 'npm install && npm run update && npm run build-client && npm run build-server && npm run docker:clean-images && npm run docker:deploy:full'
      }
    }
  }
}
