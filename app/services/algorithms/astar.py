"""
A* search algorithm implementation for route optimization.
Uses Haversine distance for edge weights and straight-line distance as heuristic.
"""
import heapq
from typing import List, Dict, Tuple, Optional
from app.services.algorithms.distance import calculate_distance_between_locations, haversine_distance


def astar(locations: List[Dict]) -> Tuple[List[Dict], float]:
    """
    Find optimal route using A* search algorithm.
    
    A* uses:
    - g(n): actual distance traveled from start to node n
    - h(n): heuristic estimate of distance from node n to goal
    - f(n) = g(n) + h(n): total estimated cost
    
    Args:
        locations: List of location dictionaries with 'lat' and 'lng' keys
    
    Returns:
        Tuple of (optimized_path, total_distance_km)
    """
    if not locations:
        return [], 0
    
    if len(locations) == 1:
        return locations, 0
    
    # For TSP-like problem, we use nearest neighbor with A* heuristic
    # This is a simplified A* that finds the best path visiting all nodes
    start = locations[0]
    unvisited = set(range(1, len(locations)))
    path = [start]
    total_distance = 0
    current_idx = 0
    
    while unvisited:
        # Calculate f(n) = g(n) + h(n) for each unvisited node
        # g(n) = distance from current to candidate
        # h(n) = minimum distance from candidate to any remaining unvisited node
        best_node_idx = None
        best_f_score = float('inf')
        
        for candidate_idx in unvisited:
            candidate = locations[candidate_idx]
            current = locations[current_idx]
            
            # g(n): actual distance from current to candidate
            g_score = calculate_distance_between_locations(current, candidate)
            
            # h(n): heuristic - minimum distance from candidate to any remaining node
            if len(unvisited) > 1:
                h_score = min(
                    calculate_distance_between_locations(
                        candidate,
                        locations[other_idx]
                    )
                    for other_idx in unvisited
                    if other_idx != candidate_idx
                )
            else:
                # If this is the last node, h(n) = 0
                h_score = 0
            
            f_score = g_score + h_score
            
            if f_score < best_f_score:
                best_f_score = f_score
                best_node_idx = candidate_idx
        
        # Move to the best node
        if best_node_idx is not None:
            next_node = locations[best_node_idx]
            current = locations[current_idx]
            distance = calculate_distance_between_locations(current, next_node)
            total_distance += distance
            
            path.append(next_node)
            current_idx = best_node_idx
            unvisited.remove(best_node_idx)
    
    return path, total_distance
