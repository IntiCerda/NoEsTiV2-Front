/**
 * Región de Coquimbo coordinates boundaries
 */
export const COQUIMBO_REGION_BOUNDS = {
    north: -29.1, 
    south: -32.2, 
    east: -69.5,  
    west: -72.0   
  };
  
  /**
   * Default map options for the region
   */
  export const getDefaultMapOptions = () => ({
    mapTypeId: "roadmap",
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: 1, 
      position: 1 
    },
    zoomControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    restriction: {
      latLngBounds: COQUIMBO_REGION_BOUNDS,
      strictBounds: false 
    }
  });
  
  /**
   * Default autocomplete options for Chile region
   */
  export const getAutocompleteOptions = () => ({
    componentRestrictions: { country: "cl" },
    fields: ["address_components", "geometry", "formatted_address", "name"],
    strictBounds: false,
    types: ["geocode", "establishment"],
    bounds: new google.maps.LatLngBounds(
      new google.maps.LatLng(COQUIMBO_REGION_BOUNDS.south, COQUIMBO_REGION_BOUNDS.west), 
      new google.maps.LatLng(COQUIMBO_REGION_BOUNDS.north, COQUIMBO_REGION_BOUNDS.east)  
    )
  });