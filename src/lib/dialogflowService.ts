import dialogflow from '@google-cloud/dialogflow'
import { v4 as uuidv4 } from 'uuid'

interface DialogflowResponse {
  text: string
  intent: string
  confidence: number
}

class DialogflowService {
  private sessionClient: dialogflow.SessionsClient
  private projectId: string

  constructor() {
    // The projectId and credentials will be loaded from environment variables
    this.projectId = process.env.DIALOGFLOW_PROJECT_ID || ''
    
    // Debug logging
    console.log('Initializing DialogflowService with:')
    console.log('Project ID:', this.projectId)
    console.log('Client Email:', process.env.DIALOGFLOW_CLIENT_EMAIL)
    console.log('Private Key exists:', !!process.env.DIALOGFLOW_PRIVATE_KEY)
    
    // Initialize the SessionsClient with credentials
    const credentials = {
      client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
      private_key: process.env.DIALOGFLOW_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }
    
    console.log('Credentials being used:', {
      client_email: credentials.client_email,
      private_key_length: credentials.private_key?.length
    })
    
    this.sessionClient = new dialogflow.SessionsClient({
      credentials,
      projectId: this.projectId,
    })
  }

  async detectIntent(text: string, sessionId: string): Promise<DialogflowResponse> {
    try {
      console.log('Detecting intent with:', {
        projectId: this.projectId,
        sessionId,
        text
      })

      // A unique identifier for the given session
      const sessionPath = this.sessionClient.projectAgentSessionPath(
        this.projectId,
        sessionId
      )

      // The text query request
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: text,
            languageCode: 'en-US',
          },
        },
      }

      console.log('Sending request to Dialogflow:', request)

      // Send request and get result
      const responses = await this.sessionClient.detectIntent(request)
      const result = responses[0].queryResult

      if (!result) {
        throw new Error('No result from Dialogflow')
      }

      return {
        text: result.fulfillmentText || '',
        intent: result.intent?.displayName || 'unknown',
        confidence: result.intentDetectionConfidence || 0,
      }
    } catch (error) {
      console.error('Error in detectIntent:', error)
      throw error
    }
  }

  // Helper method to create a new session ID
  createSessionId(): string {
    return uuidv4()
  }
}

// Export a singleton instance
export const dialogflowService = new DialogflowService() 