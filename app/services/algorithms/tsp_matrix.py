"""
TSP (Traveling Salesman) order optimization using a cost matrix.
Used with OSRM driving matrix to get best visit order by road distance/duration.
"""
from typing import List


def optimize_order_from_matrix(
    matrix_km: List[List[float]],
    start_index: int = 0,
) -> List[int]:
    """
    Greedy nearest-neighbor TSP: start at start_index, then always go to
    the nearest unvisited node. matrix_km[i][j] = driving distance (km) from i to j.
    Returns list of indices in visit order (e.g. [0, 2, 1, 3]).
    """
    n = len(matrix_km)
    if n <= 1:
        return list(range(n))
    order = [start_index]
    remaining = set(range(n)) - {start_index}
    while remaining:
        i = order[-1]
        best_j = min(remaining, key=lambda j: matrix_km[i][j] if matrix_km[i][j] is not None else float("inf"))
        # Handle OSRM null (unreachable) as large value
        dist = matrix_km[i][best_j]
        if dist is None or dist < 0:
            dist = float("inf")
        order.append(best_j)
        remaining.discard(best_j)
    return order
