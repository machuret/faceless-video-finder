
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { countries } from "@/utils/channelUtils";
import { useState } from "react";

interface CountrySelectorProps {
  selectedCountry: string | undefined;
  onSelect: (countryCode: string) => void;
}

const CountrySelector = ({ selectedCountry, onSelect }: CountrySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (countryCode: string) => {
    console.log("Selected country:", countryCode);
    onSelect(countryCode);
    setIsOpen(false);
  };

  // Find the selected country for display
  const selectedCountryName = selectedCountry 
    ? countries.find(c => c.code === selectedCountry)?.name || 'Select Country'
    : 'Select Country';

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Country</h3>
      <div className="space-y-4">
        <label className="block text-sm font-medium">Country</label>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between bg-white"
            >
              {selectedCountryName}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-[calc(100vw-3rem)] sm:w-[400px] max-h-[300px] overflow-y-auto z-50 bg-white shadow-lg"
          >
            {countries.map((country) => (
              <DropdownMenuItem
                key={country.code}
                onClick={() => handleSelect(country.code)}
                className="cursor-pointer hover:bg-gray-100 py-2"
              >
                {country.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default CountrySelector;
