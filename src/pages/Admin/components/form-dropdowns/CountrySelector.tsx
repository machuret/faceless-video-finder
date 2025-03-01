
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { countries } from "@/utils/channelUtils";

interface CountrySelectorProps {
  selectedCountry: string | undefined;
  onSelect: (countryCode: string) => void;
}

const CountrySelector = ({ selectedCountry, onSelect }: CountrySelectorProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Country</h3>
      <div className="space-y-4">
        <label className="block text-sm font-medium">Country</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {selectedCountry ? 
                countries.find(c => c.code === selectedCountry)?.name || 'Select Country' : 
                'Select Country'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full max-h-96 overflow-y-auto bg-white">
            {countries.map((country) => (
              <DropdownMenuItem
                key={country.code}
                onClick={() => onSelect(country.code)}
                className="cursor-pointer"
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
