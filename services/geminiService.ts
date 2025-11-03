// Define interfaces for the expected RIPE API response structure for type safety.
interface RipeAttribute {
  name: string;
  value: string;
}

interface RipeObject {
  type: string;
  link: {
    type: string;
    href: string;
  };
  source: {
    id: string;
  };
  attributes: {
    attribute: RipeAttribute[];
  };
}

interface RipeResponse {
  objects?: {
    object: RipeObject[];
  };
  errormsgs?: {
    errormsg: {
        severity: string;
        text: string;
    }[] | {
        severity: string;
        text: string;
    }
  }
}

/**
 * Fetches WHOIS information for a given IP address directly from the RIPE Database.
 * The response is formatted into a human-readable, RPSL-like text format.
 * @param ipAddress The IP address to look up.
 * @returns A promise that resolves to the formatted WHOIS information string.
 */
export const getWhoisInfo = async (ipAddress: string): Promise<string> => {
  try {
    // Query the RIPE REST API. The 'B' flag requests unfiltered data.
    const response = await fetch(`https://rest.db.ripe.net/search.json?query-string=${ipAddress}&flags=B`);
    
    // The RIPE API can return errors in the body even with a 200 OK status,
    // so we parse the JSON first and then check for business-level errors.
    const data: RipeResponse = await response.json();

    if (!response.ok) {
        // Handle HTTP errors (e.g., 400, 500)
        const errorMessages = data.errormsgs?.errormsg;
        if (errorMessages) {
            const message = Array.isArray(errorMessages) ? errorMessages.map(e => e.text).join(', ') : errorMessages.text;
            throw new Error(message);
        }
        throw new Error(`RIPE server returned status ${response.status}`);
    }

    // Handle the case where the IP is not found in the RIPE database.
    if (!data.objects || data.objects.object.length === 0) {
      const errorMessages = data.errormsgs?.errormsg;
      if (errorMessages) {
          const message = Array.isArray(errorMessages) ? errorMessages.map(e => e.text).join(', ') : errorMessages.text;
           if (message.includes("No Objects Found")) {
                 return `No information found for ${ipAddress} in the RIPE Database.\nThis IP may be managed by a different Regional Internet Registry (e.g., ARIN for North America).`;
           }
           return `Received a message from RIPE: ${message}`;
      }
      return `No information found for ${ipAddress} in the RIPE Database.`;
    }

    // Process and format the returned objects into RPSL format.
    const rpslOutput = data.objects.object.map(obj => {
      const attributes = obj.attributes.attribute;
      
      // Find the length of the longest attribute name for alignment.
      const maxNameLength = Math.max(...attributes.map(attr => attr.name.length));
      
      const formattedAttributes = attributes.map(attr => {
        // Pad the name with spaces to align the colons and values.
        const paddedName = `${attr.name}:`.padEnd(maxNameLength + 2);
        return `${paddedName}${attr.value}`;
      }).join('\n');
      
      return formattedAttributes;
    }).join('\n\n%----------------------------------------\n\n'); // Visual separator between different objects

    return rpslOutput;

  } catch (error) {
    console.error('Error fetching WHOIS info from RIPE:', error);
    if (error instanceof Error) {
      if(error.message.includes('Failed to fetch')) {
        return "Network Error: Could not connect to the RIPE Database service.";
      }
      // Return a user-friendly message from the caught error.
      return `An error occurred during RIPE lookup: ${error.message}`;
    }
    return "An unknown error occurred during RIPE lookup.";
  }
};
