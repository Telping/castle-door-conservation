import { useState } from 'react';
import { Search, Package, MapPin, Phone, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useQuery } from '@tanstack/react-query';
import { getMaterials } from '@/services/supabase';
import { isDemoMode, demoMaterials } from '@/services/demoData';
import { formatCurrency } from '@/lib/utils';

const categories = [
  'All',
  'Timber',
  'Ironmongery',
  'Masonry',
  'Finishes',
  'Repair',
];

const gradeColors: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
  standard: 'default',
  conservation: 'success',
  museum: 'warning',
};

export function Materials() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const { data: materials, isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      if (isDemoMode()) {
        return demoMaterials;
      }
      const { data, error } = await getMaterials();
      if (error) throw error;
      return data;
    },
  });

  const filteredMaterials = materials?.filter((material) => {
    const matchesSearch =
      search === '' ||
      material.name.toLowerCase().includes(search.toLowerCase()) ||
      material.supplier.toLowerCase().includes(search.toLowerCase()) ||
      material.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === 'All' || material.category === category;

    return matchesSearch && matchesCategory;
  });

  const groupedMaterials = filteredMaterials?.reduce((acc, material) => {
    const cat = material.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(material);
    return acc;
  }, {} as Record<string, typeof materials>);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Materials Catalog</h1>
        <p className="text-sm text-gray-600">
          Heritage-grade materials from Irish suppliers
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search materials or suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              category === cat
                ? 'bg-green-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Materials List */}
      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading materials...</div>
      ) : filteredMaterials?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No materials found matching your search.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMaterials || {}).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                <Package className="h-4 w-4" />
                {cat}
                <Badge variant="default">{items?.length}</Badge>
              </h2>
              <div className="space-y-3">
                {items?.map((material) => (
                  <Card key={material.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">
                              {material.name}
                            </h3>
                            <Badge variant={gradeColors[material.heritage_grade]}>
                              {material.heritage_grade}
                            </Badge>
                          </div>

                          <p className="mt-1 text-sm text-gray-600">
                            {material.description}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {material.unit}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {material.supplier}
                            </span>
                            {material.supplier_contact && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {material.supplier_contact}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-green-700">
                            {formatCurrency(material.unit_price)}
                          </p>
                          <p className="text-xs text-gray-500">per {material.unit}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Heritage Grades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="default">standard</Badge>
            <span className="text-gray-600">General purpose, suitable for most repairs</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success">conservation</Badge>
            <span className="text-gray-600">Heritage approved for protected structures</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="warning">museum</Badge>
            <span className="text-gray-600">Highest grade for archaeological conservation</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
