import React, { useState } from 'react';
import { 
  format, 
  startOfDay,
  endOfDay,
  isToday,
  addDays,
  subDays,
  isWithinInterval
} from 'date-fns';
import { Todo, Category } from '../types';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Bookmark, SendHorizonal, TrendingUp, Users } from 'lucide-react';
import TodoModal from './TodoModal';

interface DateFilterOption {
  label: string;
  getValue: () => { start: Date; end: Date };
}

const dateFilterOptions: DateFilterOption[] = [
  {
    label: 'Hari Ini',
    getValue: () => ({
      start: startOfDay(new Date()),
      end: endOfDay(new Date())
    })
  },
  {
    label: 'Kemarin',
    getValue: () => ({
      start: startOfDay(subDays(new Date(), 1)),
      end: endOfDay(subDays(new Date(), 1))
    })
  },
  {
    label: 'Besok',
    getValue: () => ({
      start: startOfDay(addDays(new Date(), 1)),
      end: endOfDay(addDays(new Date(), 1))
    })
  }
];

interface DayViewProps {
  todos: Todo[];
  categories: Category[];
}

// Fungsi untuk menyesuaikan warna (membuat lebih gelap)
const adjustColor = (color: string, amount: number): string => {
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255,Math.max(0,parseInt(color,16)+amount)).toString(16)).substr(-2));
};

// Fungsi untuk mendapatkan icon kategori
const categoryIcons = {
  'dripsender': SendHorizonal,
  'upgrading': TrendingUp,
  'parenting': Users,
  // Tambahkan kategori lain sesuai kebutuhan
};

const getCategoryIcon = (categoryName: string) => {
  const lowerCaseName = categoryName.toLowerCase();
  return categoryIcons[lowerCaseName] || Bookmark;
};

// Fungsi untuk mendapatkan warna default kategori "Semua"
const getDefaultCategoryColor = () => {
  return {
    main: '#3B82F6', // blue-500
    darker: adjustColor('#3B82F6', -20),
    shadow: 'rgba(59, 130, 246, 0.3)' // blue-500 with opacity
  };
};

// Fungsi untuk mendapatkan warna kategori
const getCategoryColors = (color: string) => {
  if (!color.startsWith('#')) {
    // Jika warna dalam format RGB, konversi ke HEX
    const rgb = color.match(/\d+/g);
    if (!rgb) return getDefaultCategoryColor();
    
    color = '#' + rgb.map(x => {
      const hex = parseInt(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  return {
    main: color,
    darker: adjustColor(color, -20),
    shadow: `${color}4D` // 30% opacity in hex
  };
};

export default function DayView({ todos, categories }: DayViewProps) {
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<DateFilterOption>(dateFilterOptions[0]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigateDay = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1);
      return newDate;
    });
    setSelectedFilter({
      label: 'Custom',
      getValue: () => ({
        start: startOfDay(selectedDate),
        end: endOfDay(selectedDate)
      })
    });
  };

  const filteredTodos = todos.filter(todo => {
    const todoDate = new Date(todo.date);
    const dateMatch = isWithinInterval(todoDate, {
      start: startOfDay(selectedDate),
      end: endOfDay(selectedDate)
    });
    
    const categoryMatch = selectedCategory === 'all' || todo.category === selectedCategory;
    
    return dateMatch && categoryMatch;
  });

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#3B82F6';
  };

  const handleTodoClick = (todo: Todo) => {
    setSelectedTodo(todo);
  };

  return (
    <>
      {/* Category Filter Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-sm p-4 mb-6">
            <div className="overflow-x-auto">
              <div className="flex flex-nowrap gap-3 pb-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`group flex-shrink-0 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-[1.02] ${
                    selectedCategory === 'all'
                      ? 'text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md'
                  }`}
                  style={{
                    background: selectedCategory === 'all'
                      ? `linear-gradient(235deg, ${getDefaultCategoryColor().main}, ${getDefaultCategoryColor().darker})`
                      : undefined,
                    boxShadow: selectedCategory === 'all'
                      ? `0 10px 15px -3px ${getDefaultCategoryColor().shadow}`
                      : undefined
                  }}
                >
                  <div className="flex items-center">
                    <Bookmark className={`w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110 ${
                      selectedCategory === 'all' ? '' : `group-hover:text-[${getDefaultCategoryColor().main}]`
                    }`} />
                    <span className="font-medium whitespace-nowrap">Semua</span>
                  </div>
                </button>
                {categories.map((category) => {
                  const IconComponent = getCategoryIcon(category.name);
                  const colors = getCategoryColors(category.color);

                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`group flex-shrink-0 px-4 py-2.5 rounded-lg transition-all duration-300 hover:scale-[1.02] ${
                        selectedCategory === category.id
                          ? 'text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md'
                      }`}
                      style={{
                        background: selectedCategory === category.id 
                          ? `linear-gradient(235deg, ${colors.main}, ${colors.darker})`
                          : undefined,
                        boxShadow: selectedCategory === category.id 
                          ? `0 10px 15px -3px ${colors.shadow}`
                          : undefined,
                        '--hover-color': colors.main // CSS variable untuk hover effect
                      } as React.CSSProperties}
                    >
                      <div className="flex items-center">
                        <IconComponent 
                          className={`w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110 ${
                            selectedCategory === category.id ? '' : 'group-hover:text-[var(--hover-color)]'
                          }`}
                          style={selectedCategory !== category.id ? { color: colors.main } : undefined}
                        />
                        <span className="font-medium whitespace-nowrap">{category.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      {/* Main Content Container */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 border-b bg-gradient-to-r from-violet-50 to-fuchsia-50">
          <div className="flex items-center mb-4 sm:mb-0">
            <Calendar className="w-5 h-5 text-violet-600 mr-2" />
            <h2 className="text-xl font-bold text-violet-700 tracking-wide">Daily Calendar</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            {/* Navigation buttons */}
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => navigateDay('prev')}
                className="p-2 text-gray-600 hover:bg-violet-100 rounded-lg transition-colors"
                aria-label="Previous day"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-gray-600 min-w-[150px] text-center">
                {format(selectedDate, 'EEEE, d MMMM yyyy')
                  .replace('Monday', 'Senin')
                  .replace('Tuesday', 'Selasa')
                  .replace('Wednesday', 'Rabu')
                  .replace('Thursday', 'Kamis')
                  .replace('Friday', 'Jumat')
                  .replace('Saturday', 'Sabtu')
                  .replace('Sunday', 'Minggu')
                  .replace('January', 'Jan')
                  .replace('February', 'Feb')
                  .replace('March', 'Mar')
                  .replace('April', 'Apr')
                  .replace('May', 'Mei')
                  .replace('June', 'Juni')
                  .replace('July', 'Juli')
                  .replace('August', 'Agu')
                  .replace('September', 'Sep')
                  .replace('October', 'Okt')
                  .replace('November', 'Nov')
                  .replace('December', 'Des')}
              </span>
              <button
                onClick={() => navigateDay('next')}
                className="p-2 text-gray-600 hover:bg-violet-100 rounded-lg transition-colors"
                aria-label="Next day"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Filter dropdown */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className="w-full sm:w-auto flex items-center justify-between space-x-2 px-4 py-2.5 text-sm bg-white border-2 border-violet-200 rounded-lg hover:bg-violet-50 hover:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
              >
                <span className="font-medium text-gray-700">{selectedFilter.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDateFilter ? 'transform rotate-180' : ''}`} />
              </button>

              {showDateFilter && (
                <>
                  {/* Overlay untuk mobile */}
                  <div 
                    className="fixed inset-0 bg-black/20 z-40 sm:hidden"
                    onClick={() => setShowDateFilter(false)}
                  />
                  
                  {/* Dropdown content */}
                  <div className="fixed sm:absolute bottom-0 sm:bottom-auto inset-x-0 sm:inset-auto sm:right-0 sm:top-full mt-2 z-50 bg-white border-2 border-violet-100 rounded-t-xl sm:rounded-xl shadow-xl transform transition-all duration-200 ease-out sm:w-80">
                    <div className="p-2 border-b sm:hidden">
                      <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto"/>
                    </div>
                    <div className="max-h-[70vh] sm:max-h-[400px] overflow-y-auto custom-scrollbar">
                      <div className="p-3">
                        {dateFilterOptions.map((option) => (
                          <button
                            key={option.label}
                            onClick={() => {
                              const range = option.getValue();
                              setSelectedDate(range.start);
                              setSelectedFilter(option);
                              setShowDateFilter(false);
                            }}
                            className="block w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-violet-50 rounded-lg transition-colors duration-150 mb-1 hover:shadow-sm"
                          >
                            {option.label}
                          </button>
                        ))}
                        <div className="border-t border-violet-100 mt-3 pt-4">
                          <div className="text-sm font-semibold text-gray-800 px-4 mb-3">Tanggal Custom</div>
                          <div className="px-4 space-y-4">
                            <div className="flex flex-col">
                              <label className="text-sm font-medium text-gray-600 mb-1.5">Pilih Tanggal</label>
                              <input
                                type="date"
                                className="w-full px-4 py-2.5 border-2 border-violet-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 hover:border-violet-300"
                                value={format(selectedDate, 'yyyy-MM-dd')}
                                onChange={(e) => {
                                  const newDate = new Date(e.target.value);
                                  setSelectedDate(newDate);
                                  setSelectedFilter({
                                    label: 'Custom',
                                    getValue: () => ({
                                      start: startOfDay(newDate),
                                      end: endOfDay(newDate)
                                    })
                                  });
                                  setShowDateFilter(false);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Todo list content */}
        <div className="p-4">
          <div
            className={`min-h-[30rem] rounded-lg transition-all duration-300 ${
              isToday(selectedDate) 
                ? 'bg-gradient-to-br from-violet-500 via-violet-600 to-violet-700 text-white shadow-lg shadow-violet-200/50' 
                : 'bg-gray-50/80 hover:bg-violet-50/50'
            }`}
          >
            <div className={`p-4 flex items-center justify-between ${
              isToday(selectedDate) ? 'text-white' : 'text-gray-700'
            }`}>
              <div className="flex items-center gap-2">
                <Calendar className={`w-5 h-5 ${
                  isToday(selectedDate) ? '' : 'text-violet-500'
                }`} />
                <span className="font-medium">
                  {format(selectedDate, 'EEEE')
                    .replace('Monday', 'Senin')
                    .replace('Tuesday', 'Selasa')
                    .replace('Wednesday', 'Rabu')
                    .replace('Thursday', 'Kamis')
                    .replace('Friday', 'Jumat')
                    .replace('Saturday', 'Sabtu')
                    .replace('Sunday', 'Minggu')}
                </span>
              </div>
              <span className={`text-sm ${isToday(selectedDate) ? 'text-white/90' : 'text-gray-500'}`}>
                {format(selectedDate, 'd MMMM yyyy')
                  .replace('January', 'Jan')
                  .replace('February', 'Feb')
                  .replace('March', 'Mar')
                  .replace('April', 'Apr')
                  .replace('May', 'Mei')
                  .replace('June', 'Jun')
                  .replace('July', 'Jul')
                  .replace('August', 'Agu')
                  .replace('September', 'Sep')
                  .replace('October', 'Okt')
                  .replace('November', 'Nov')
                  .replace('December', 'Des')}
              </span>
            </div>

            <div className="p-4 space-y-2">
              {filteredTodos.map((todo) => {
                const category = categories.find(cat => cat.id === todo.category);
                const categoryColor = category?.color || '#6B7280';
                
                return (
                  <div
                    key={todo.id}
                    className={`p-2 rounded-md transition-all duration-200 group w-full overflow-hidden ${
                      isToday(selectedDate)
                        ? 'bg-white/10 hover:bg-white/20'
                        : 'bg-white hover:bg-violet-50'
                    }`}
                    onClick={() => handleTodoClick(todo)}
                  >
                    <div className="flex items-start gap-2 w-full">
                      <div 
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                        style={{ backgroundColor: categoryColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm leading-tight break-words line-clamp-2 ${
                          todo.completed 
                            ? 'line-through' 
                            : isToday(selectedDate)
                              ? 'text-white'
                              : 'text-gray-700'
                        }`}>
                          {todo.title}
                        </div>
                        {todo.description && (
                          <p className={`text-xs mt-0.5 line-clamp-1 ${
                            isToday(selectedDate)
                              ? 'text-white/80'
                              : 'text-gray-500'
                          }`}>
                            {todo.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {selectedTodo && (
        <TodoModal
          todo={selectedTodo}
          categories={categories}
          isOpen={!!selectedTodo}
          onClose={() => setSelectedTodo(null)}
          onUpdate={() => {
            setSelectedTodo(null);
          }}
        />
      )}
    </>
  );
}