'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Search, Filter, Check } from "lucide-react";

type FilterOption = {
    label: string;
    value: string;
};

type SearchFilterProps = {
    filterOptions: FilterOption[];
    placeholder?: string;
    className?: string;
    baseUrl: string;
};

const SearchFilter = ({
    filterOptions,
    placeholder = "Search interviews...",
    className = "",
    baseUrl
}: SearchFilterProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const currentSearch = searchParams.get('search') || '';
    const currentFilter = searchParams.get('filter') || '';
    
    const [searchTerm, setSearchTerm] = useState(currentSearch);
    const [activeFilter, setActiveFilter] = useState(currentFilter);

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (searchTerm) {
            params.set('search', searchTerm);
        } else {
            params.delete('search');
        }
        
        const newUrl = `${baseUrl}?${params.toString()}`;
        router.push(newUrl);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleFilterClick = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const newFilter = activeFilter === value ? "" : value;
        
        setActiveFilter(newFilter);
        
        if (newFilter) {
            params.set('filter', newFilter);
        } else {
            params.delete('filter');
        }
        
        const newUrl = `${baseUrl}?${params.toString()}`;
        router.push(newUrl);
    };

    return (
        <div className={`flex items-center gap-3 mb-6 w-full ${className}`}>
            <div className="relative flex-1">
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-9 pr-4 py-2 w-full rounded-full border-gray-300 dark:border-gray-700"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={handleSearch}
                >
                    <Search size={18} />
                </Button>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 rounded-full">
                        <Filter size={16} />
                        Filter
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    {filterOptions.map((option) => (
                        <DropdownMenuItem
                            key={option.value}
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => handleFilterClick(option.value)}
                        >
                            {option.label}
                            {activeFilter === option.value && <Check size={16} />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default SearchFilter; 