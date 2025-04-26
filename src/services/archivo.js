const backendUrl = import.meta.env.VITE_BACKEND_URL;
import axios from 'axios';

export async function fetchData() {
    try {
      const graphqlQuery = {
        query: `
            query {
            locations {
                id
                latitude
                longitude
                comment
                createdAt
                title
                category
            }
          }
        `
      };
  
      const response = await axios.post(backendUrl, graphqlQuery, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Respuesta completa:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error en fetchData:', error);
      throw error;
    }
  }
  
  export async function sendMarker({ latitude, longitude, title, comment, category }) {
    const graphqlMutation = {
      query: `
        mutation CreateLocation($latitude: Float!, $longitude: Float!, $title: String, $comment: String, $category: String) {
          createLocation(latitude: $latitude, longitude: $longitude, title: $title, comment: $comment, category: $category) {
            id
            latitude
            longitude
            comment
            createdAt
            title
            category
          }
        }
      `,
      variables: {
        latitude,
        longitude,
        title,
        comment,
        category
      }
    };
  
    try {
      const response = await axios.post(backendUrl, graphqlMutation, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('Respuesta de createLocation:', response.data);
      return response.data.data.createLocation;
    } catch (error) {
      console.error('Error en sendMarker:', error);
      throw error;
    }
  }
  