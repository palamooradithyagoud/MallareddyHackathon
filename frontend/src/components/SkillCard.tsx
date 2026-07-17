import React, { useState } from 'react';
import { Plus, X, Award } from 'lucide-react';

interface Skill {
  name: string;
  level: string;
}

interface SkillCardProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skills = [], onChange }) => {
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    // Check if skill already exists
    const duplicate = skills.find(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase());
    if (duplicate) {
      setNewSkillName('');
      return;
    }

    const updated = [...skills, { name: newSkillName.trim(), level: newSkillLevel }];
    onChange(updated);
    setNewSkillName('');
  };

  const handleRemoveSkill = (indexToRemove: number) => {
    const updated = skills.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const getLevelBadgeClass = (level: string) => {
    switch (level.toLowerCase()) {
      case 'expert':
        return 'glow-tag-purple';
      case 'intermediate':
        return 'glow-tag-blue';
      case 'beginner':
      default:
        return 'glow-tag-cyan';
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
        <Award className="h-5 w-5 text-accent" />
        Core Technical Skills
      </h3>

      {/* Skills add form */}
      <form onSubmit={handleAddSkill} className="flex gap-2 flex-wrap sm:flex-nowrap">
        <input
          type="text"
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          placeholder="Add skill (e.g. Python, Docker)..."
          className="flex-1 min-w-[150px] rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
        <select
          value={newSkillLevel}
          onChange={(e) => setNewSkillLevel(e.target.value)}
          className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all cursor-pointer"
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Expert">Expert</option>
        </select>
        <button
          type="submit"
          className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-button px-4 py-2 text-sm font-semibold text-white hover:bg-gradient-button-hover shadow-glow-primary transition-all whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </form>

      {/* Render Tags */}
      {skills.length === 0 ? (
        <p className="text-xs text-text-muted italic pt-2">No skills added yet. Add one above or parse your resume.</p>
      ) : (
        <div className="flex flex-wrap gap-2 pt-2">
          {skills.map((skill, index) => (
            <div
              key={index}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getLevelBadgeClass(skill.level)}`}
            >
              <span>{skill.name}</span>
              <span className="text-[10px] opacity-75 font-normal">({skill.level})</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(index)}
                className="hover:text-white transition-colors ml-1 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillCard;
