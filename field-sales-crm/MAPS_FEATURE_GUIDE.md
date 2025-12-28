# 🗺️ Maps Feature Guide

## Overview

The Maps feature provides powerful route planning and visualization capabilities for field sales representatives. View all your clients on an interactive map, plan optimized routes, and get turn-by-turn directions.

## ✨ Features

### 1. **Interactive Map View**
- View all clients with GPS locations on a map
- Custom markers color-coded by customer potential:
  - 🟢 Green: High potential
  - 🟡 Yellow: Medium potential
  - 🔴 Red: Low potential
- Tap markers to see client details
- Quick actions: Call or message directly from map

### 2. **Route Planning**
- Select multiple clients to visit
- Automatic route optimization using nearest-neighbor algorithm
- Visual route display with numbered waypoints
- Distance and time estimates for entire route

### 3. **Route Optimization**
- Intelligent route ordering to minimize travel time
- Considers current location as starting point
- Optimizes for shortest total distance
- Reorder waypoints manually if needed

### 4. **Client Information**
- Client name and company
- Phone number with quick call/message
- Address information
- Customer potential indicator

## 🎯 How to Use

### Viewing Clients on Map

1. From the **Client List** screen, tap the **"🗺️ Map View"** button
2. All clients with GPS locations will appear as markers
3. Tap any marker to see client details
4. Use pinch-to-zoom and drag to navigate the map

### Planning a Route

1. On the Map View screen, tap **"📍 Plan Route"**
2. Tap client markers to select them (they'll turn blue)
3. Select at least 2 clients
4. Tap **"Optimize Route"** to calculate the best route
5. The route will appear as a blue line connecting the clients
6. Markers will show numbers indicating visit order

### Understanding Route Information

The route panel shows:
- **📏 Distance**: Total distance to travel (e.g., "15.3 km")
- **⏱️ Time**: Estimated travel time (e.g., "25 min")
- **Number of stops**: How many clients in the route

### Quick Actions from Map

When you tap a marker, you can:
- **📞 Call**: Instantly call the client
- **💬 Message**: Send an SMS to the client
- **View Details**: Tap the marker again to go to client detail screen

### Centering on Your Location

1. Tap the **📍** button in the top-right corner
2. The map will center on your current location
3. Requires location permissions

## 🔧 Technical Details

### Route Optimization Algorithm

The app uses a **Nearest Neighbor TSP (Traveling Salesman Problem)** algorithm:

1. Starts from your current location (or first selected client)
2. Finds the nearest unvisited client
3. Moves to that client and repeats
4. Continues until all clients are visited

This provides a good balance between optimization quality and calculation speed.

### Distance Calculation

- **On-map distances**: Calculated using Haversine formula (straight-line)
- **Route distances**: Calculated using Google Directions API (actual roads)
- **Travel time**: Based on current traffic conditions (when available)

### Data Requirements

For a client to appear on the map:
- Must have GPS location captured (latitude & longitude)
- Location must be valid coordinates
- Client must not be deleted

### Performance Considerations

- **Marker clustering**: Automatically groups nearby markers when zoomed out
- **Route caching**: Calculated routes are cached to reduce API calls
- **Lazy loading**: Map loads only visible area
- **Optimized rendering**: Uses native map components for smooth performance

## 🎨 Customization

### Marker Colors

Markers are color-coded by customer potential:
```javascript
High potential: #22c55e (green)
Medium potential: #f59e0b (yellow)
Low potential: #ef4444 (red)
Selected: #3b82f6 (blue)
```

### Route Styling

- **Route line color**: Blue (#3b82f6)
- **Route line width**: 4 pixels
- **Waypoint numbers**: White text on colored background

## 📊 Use Cases

### Daily Route Planning
1. View all clients in your territory
2. Select clients you need to visit today
3. Optimize the route to minimize drive time
4. Follow the numbered waypoints

### Territory Analysis
1. Zoom out to see client distribution
2. Identify clusters of high-potential clients
3. Plan efficient territory coverage
4. Spot gaps in coverage

### Quick Client Lookup
1. Open map view
2. Visually locate client by area
3. Tap marker for quick call/message
4. No need to search through list

## 🚀 Tips & Best Practices

### For Best Results:
- ✅ Always capture GPS location when adding clients
- ✅ Update client locations if they move
- ✅ Plan routes with 5-10 clients for optimal efficiency
- ✅ Check route before starting your day
- ✅ Use current location as starting point

### Common Workflows:

**Morning Route Planning:**
1. Open Map View
2. Select today's clients
3. Optimize route
4. Note the order and start driving

**On-the-Go Updates:**
1. Complete a client visit
2. Add interaction notes
3. Check map for next closest client
4. Navigate to next stop

**Territory Review:**
1. View all clients on map
2. Identify high-potential clusters
3. Plan focused campaigns
4. Schedule visits efficiently

## ⚠️ Limitations

- Requires active internet connection for route calculation
- Google Maps API has usage quotas (see GOOGLE_MAPS_SETUP.md)
- Route optimization is approximate (not perfect TSP solution)
- Traffic conditions may affect actual travel time
- Requires location permissions

## 🔮 Future Enhancements

Planned features:
- [ ] Offline map caching
- [ ] Multi-day route planning
- [ ] Traffic-aware routing
- [ ] Route history and analytics
- [ ] Export routes to Google Maps app
- [ ] Geofencing for client visits
- [ ] Heatmap of client density
- [ ] Custom map styles

## 📞 Support

If you encounter issues:
1. Check GOOGLE_MAPS_SETUP.md for configuration
2. Verify location permissions are granted
3. Ensure clients have valid GPS coordinates
4. Check internet connectivity
5. Review API quota limits in Google Cloud Console

