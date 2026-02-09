import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bed, Bath, Car, Maximize, MapPin } from 'lucide-react';
import { Property, operationLabels, propertyTypeLabels, formatPrice, formatArea } from '@/types/property';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const mainImage = property.images?.[0] || '/placeholder-property.jpg';
  
  return (
    <Link href={`/propiedades/${property.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <Image
            src={mainImage}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-primary text-primary-foreground">
              {operationLabels[property.operation]}
            </Badge>
            <Badge variant="secondary">
              {propertyTypeLabels[property.property_type]}
            </Badge>
          </div>
          {/* Price Badge */}
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-green-600 text-white text-lg font-bold px-3 py-1">
              {formatPrice(property.price_clp)}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Location */}
          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
            <MapPin className="w-4 h-4" />
            <span>{property.commune}{property.region ? `, ${property.region}` : ''}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {property.title}
          </h3>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3 mt-auto pt-3 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms} Dorm.</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms} Baños</span>
            </div>
            {property.parking_count !== null && property.parking_count > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Car className="w-4 h-4" />
                <span>{property.parking_count} Estac.</span>
              </div>
            )}
            {property.built_area && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Maximize className="w-4 h-4" />
                <span>{formatArea(property.built_area)}</span>
              </div>
            )}
          </div>

          {/* Amenities Preview */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {property.amenities.slice(0, 3).map((amenity, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {property.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{property.amenities.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
