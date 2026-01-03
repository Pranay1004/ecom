"""
Minimal local stub of networkx to satisfy trimesh when a system install is unavailable.

This provides a very small subset: Graph, DiGraph (alias), and connected_components.
It's intentionally lightweight and only intended for preprocessing and analysis tasks
where a full feature set is not required. If you can, install the real `networkx`.
"""
from collections import defaultdict


class Graph:
    def __init__(self):
        # adjacency: node -> {neighbor: attr_dict}
        self._adj = defaultdict(dict)

    def add_node(self, n):
        _ = self._adj[n]

    def add_nodes_from(self, nodes):
        for n in nodes:
            self.add_node(n)

    def add_edge(self, a, b, **kwargs):
        # Accept kwargs as edge attributes and store them in adjacency
        if b not in self._adj[a]:
            self._adj[a][b] = {}
        if a not in self._adj[b]:
            self._adj[b][a] = {}
        # store attributes if provided
        if kwargs:
            self._adj[a][b].update(kwargs)
            self._adj[b][a].update(kwargs)

    def nodes(self):
        return list(self._adj.keys())

    def edges(self):
        res = []
        for a, nbrs in self._adj.items():
            for b in nbrs.keys():
                if a <= b:
                    res.append((a, b))
        return res

    def __getitem__(self, node):
        # allow G[node] to return neighbor->attr mapping
        return self._adj.get(node, {})

    def neighbors(self, node):
        return list(self._adj.get(node, {}).keys())


DiGraph = Graph

# Provide MultiGraph/MultiDiGraph aliases used by some libraries
class MultiGraph(Graph):
    pass

class MultiDiGraph(Graph):
    pass

MultiDiGraph = MultiDiGraph
MultiGraph = MultiGraph


def connected_components(G):
    seen = set()
    for n in G.nodes():
        if n in seen:
            continue
        stack = [n]
        comp = set()
        while stack:
            v = stack.pop()
            if v in comp:
                continue
            comp.add(v)
            seen.add(v)
            for w in G._adj.get(v, []):
                if w not in comp:
                    stack.append(w)
        yield comp


def number_connected_components(G):
    return sum(1 for _ in connected_components(G))
