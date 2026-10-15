import React from 'react';
import { BookOpen, User, GraduationCap, RotateCcw } from 'lucide-react';
import { Role, Student } from '../types';

interface HeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  selectedStudentId: string;
  onStudentChange: (studentId: string) => void;
  students: Student[];
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  selectedStudentId,
  onStudentChange,
  students,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                Bimbingan Skripsi
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 font-normal">
                Sistem Pemantauan Progres & Revisi
              </span>
            </div>
          </div>

          {/* Zone 2: Role Switcher & Student Selector */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Role Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium border border-slate-200/80">
              <button
                type="button"
                onClick={() => onRoleChange('dosen')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                  currentRole === 'dosen'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dosen Pembimbing</span>
              </button>

              <button
                type="button"
                onClick={() => onRoleChange('mahasiswa')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                  currentRole === 'mahasiswa'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mahasiswa</span>
              </button>
            </div>

            {/* If Mahasiswa is selected, show which student is being simulated */}
            {currentRole === 'mahasiswa' && (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-xs text-slate-500">Akun:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => onStudentChange(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 max-w-[220px] truncate"
                >
                  {students.map((mhs) => (
                    <option key={mhs.id} value={mhs.id}>
                      {mhs.nama} ({mhs.nim})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Zone 3: Quick Reset / Utility Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onResetData}
              title="Reset data ke data contoh bawaan"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
