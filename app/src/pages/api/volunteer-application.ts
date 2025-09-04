import type { APIRoute } from 'astro';

const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'https://api.dotnetecuador.com';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse the request body with proper error handling
    let body;
    try {
      const requestText = await request.text();
      if (!requestText.trim()) {
        throw new Error('Empty request body');
      }
      body = JSON.parse(requestText);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid request body',
          errors: ['Request body is not valid JSON']
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Log the request for debugging
    console.log('Volunteer application request:', JSON.stringify(body, null, 2));
    
    // Forward the request to the external API
    const response = await fetch(`${API_BASE_URL}/api/v1/volunteer-application/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    console.log('External API response status:', response.status, response.statusText);

    // Get response text first to handle potential parsing issues
    const responseText = await response.text();
    console.log('External API raw response:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse API response as JSON:', parseError);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid response from API server',
          errors: ['Response is not valid JSON']
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    if (!response.ok) {
      console.log('External API error response:', result);
      return new Response(
        JSON.stringify({
          success: false,
          message: result.message || `API Error: ${response.status}`,
          errors: result.errors || [`HTTP ${response.status}`]
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('External API success response:', result);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: result.data,
        message: result.message || 'Aplicación enviada exitosamente'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('API proxy error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error interno del servidor',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};