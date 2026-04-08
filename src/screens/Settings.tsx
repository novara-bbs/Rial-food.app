import { useTheme } from '../contexts/ThemeContext';
import { Palette, Moon, Sun, Check, User, Target, Smartphone, Leaf, LogOut, ChevronRight, Crown, Sparkles, Users, Plus, Trash2, Globe } from 'lucide-react';
import { useState } from 'react';
import { useI18n, type Locale } from '../i18n';

export default function Settings({ dailyMacros, setDailyMacros, isPro, setIsPro, showAIBot, setShowAIBot, userProfile, setUserProfile }: { dailyMacros?: any, setDailyMacros?: any, isPro?: boolean, setIsPro?: any, showAIBot?: boolean, setShowAIBot?: any, userProfile?: any, setUserProfile?: any }) {
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', age: 30, goal: 'maintain', activityLevel: 'moderate' });

  const addFamilyMember = () => {
    if (!newMember.name) return;
    setUserProfile((prev: any) => ({
      ...prev,
      family: [...(prev.family || []), { ...newMember, id: Date.now().toString() }]
    }));
    setNewMember({ name: '', age: 30, goal: 'maintain', activityLevel: 'moderate' });
    setIsAddingMember(false);
  };

  const removeFamilyMember = (id: string) => {
    setUserProfile((prev: any) => ({
      ...prev,
      family: (prev.family || []).filter((m: any) => m.id !== id)
    }));
  };
  const [connectedDevices, setConnectedDevices] = useState({
    whoop: true,
    oura: false,
    garmin: false
  });

  const toggleDevice = (device: keyof typeof connectedDevices) => {
    setConnectedDevices(prev => ({
      ...prev,
      [device]: !prev[device]
    }));
  };

  const toggleDietaryPreference = (pref: string) => {
    if (!setUserProfile) return;
    setUserProfile((prev: any) => {
      const current = prev.dietaryPreferences || [];
      if (current.includes(pref)) {
        return { ...prev, dietaryPreferences: current.filter((p: string) => p !== pref) };
      }
      return { ...prev, dietaryPreferences: [...current, pref] };
    });
  };

  const updateBiometric = (key: string, value: any) => {
    if (!setUserProfile) return;
    setUserProfile((prev: any) => ({ ...prev, [key]: value }));
  };

  const dietaryOptions = ['Vegano', 'Vegetariano', 'Keto', 'Alto en Proteína', 'Sin Gluten', 'Sin Lácteos', 'Paleo', 'Bajo en Carbohidratos'];

  const themes = [
    { id: 'dark', name: 'Volt Pro (Oscuro)', color: '#dcfd05', bg: '#09090b' },
    { id: 'light', name: 'Volt Pro (Claro)', color: '#000000', bg: '#ffffff' },
    { id: 'blue-dark', name: 'Ocean Pro (Oscuro)', color: '#38bdf8', bg: '#020617' },
    { id: 'blue-light', name: 'Ocean Pro (Claro)', color: '#0284c7', bg: '#f8fafc' },
    { id: 'orange-dark', name: 'Ember Pro (Oscuro)', color: '#fb923c', bg: '#0c0a09' },
    { id: 'orange-light', name: 'Ember Pro (Claro)', color: '#ea580c', bg: '#fafaf9' },
  ] as const;

  return (
    <div className="px-6 max-w-4xl mx-auto space-y-8">
      <section className="space-y-6">
        <span className="font-label text-xs tracking-[0.2em] text-primary uppercase mb-1 block">{t.settings.title}</span>
        <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter uppercase text-tertiary mb-6">{t.settings.title}</h2>
        
        {/* Profile Section */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20 flex items-center gap-4">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Perfil" className="w-16 h-16 rounded-full object-cover border-2 border-primary" referrerPolicy="no-referrer" />
          <div className="flex-1">
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">Sarah Jenkins</h3>
            {isPro ? (
              <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-sm font-label font-bold uppercase tracking-widest inline-block mt-1 flex items-center gap-1 w-fit">
                <Crown className="w-3 h-3" /> Miembro Pro
              </span>
            ) : (
              <span className="bg-surface-container-highest text-on-surface-variant text-[10px] px-2 py-0.5 rounded-sm font-label font-bold uppercase tracking-widest inline-block mt-1">
                Plan Gratuito
              </span>
            )}
          </div>
          <button 
            onClick={() => setIsPro && setIsPro(!isPro)}
            className={`px-4 py-2 rounded-sm font-label text-xs font-bold tracking-widest uppercase transition-colors ${
              isPro 
                ? 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-low border border-outline-variant/30' 
                : 'bg-primary text-on-primary hover:bg-primary/90'
            }`}
          >
            {isPro ? 'Gestionar' : 'Mejorar'}
          </button>
        </div>

        {/* Dashboard Mode Section */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase tracking-tight">Experiencia de Usuario</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-lg border border-outline-variant/10">
              <div>
                <h4 className="font-headline font-bold text-sm text-tertiary uppercase tracking-widest">Modo del Panel</h4>
                <p className="text-xs text-on-surface-variant mt-1">Elige cuánta información quieres ver en tu pantalla principal.</p>
              </div>
              <div className="flex bg-surface-container-low rounded-full p-1 border border-outline-variant/20">
                <button
                  onClick={() => updateBiometric('mode', 'simple')}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${userProfile?.mode === 'simple' || !userProfile?.mode ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-tertiary'}`}
                >
                  Simple
                </button>
                <button
                  onClick={() => updateBiometric('mode', 'advanced')}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${userProfile?.mode === 'advanced' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-tertiary'}`}
                >
                  Avanzado
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Biometrics Section */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-primary" />
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">Biometría</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">Edad</label>
              <input 
                type="number" 
                value={userProfile?.age || 32}
                onChange={(e) => updateBiometric('age', parseInt(e.target.value))}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary font-headline font-bold focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">Altura (cm)</label>
              <input 
                type="number" 
                value={userProfile?.height || 175}
                onChange={(e) => updateBiometric('height', parseInt(e.target.value))}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary font-headline font-bold focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">Peso (kg)</label>
              <input 
                type="number" 
                value={userProfile?.weight || 78}
                onChange={(e) => updateBiometric('weight', parseInt(e.target.value))}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary font-headline font-bold focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">Género</label>
              <select 
                value={userProfile?.gender || 'female'}
                onChange={(e) => updateBiometric('gender', e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary font-headline font-bold focus:outline-none focus:border-primary uppercase text-xs"
              >
                <option value="male">Hombre</option>
                <option value="female">Mujer</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Family Profiles Section */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              <h3 className="font-headline text-xl font-bold text-tertiary uppercase">Perfiles Familiares</h3>
            </div>
            <button 
              onClick={() => setIsAddingMember(true)}
              className="text-primary font-label text-[10px] font-bold tracking-widest uppercase hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Añadir Miembro
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(userProfile?.family || []).map((member: any) => (
              <div key={member.id} className="bg-surface-container-highest p-4 rounded-sm border border-outline-variant/10 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-sm uppercase text-tertiary">{member.name}</h4>
                    <p className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant">
                      {member.age} años • {member.goal === 'lose' ? 'Pérdida de Peso' : member.goal === 'maintain' ? 'Mantener' : member.goal === 'gain' ? 'Ganar Músculo' : 'Rendimiento'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => removeFamilyMember(member.id)}
                  className="text-outline hover:text-error transition-colors opacity-0 group-hover:opacity-100 p-2"
                  aria-label={`Eliminar ${member.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {isAddingMember && (
              <div className="bg-surface-container-highest p-4 rounded-sm border border-primary/30 col-span-full">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-full">
                    <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">Nombre</label>
                    <input 
                      type="text" 
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary font-headline font-bold focus:outline-none focus:border-primary"
                      placeholder="NOMBRE DEL MIEMBRO"
                    />
                  </div>
                  <div>
                    <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">Edad</label>
                    <input 
                      type="number" 
                      value={newMember.age}
                      onChange={(e) => setNewMember({ ...newMember, age: parseInt(e.target.value) })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary font-headline font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">Objetivo</label>
                    <select 
                      value={newMember.goal}
                      onChange={(e) => setNewMember({ ...newMember, goal: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary font-headline font-bold focus:outline-none focus:border-primary uppercase text-xs"
                    >
                      <option value="lose">Pérdida de Peso</option>
                      <option value="maintain">Mantener</option>
                      <option value="gain">Ganar Músculo</option>
                      <option value="performance">Rendimiento</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={addFamilyMember}
                    className="flex-1 bg-primary text-on-primary py-2 rounded-sm font-label text-xs font-bold tracking-widest uppercase"
                  >
                    Guardar Miembro
                  </button>
                  <button 
                    onClick={() => setIsAddingMember(false)}
                    className="flex-1 bg-surface-container-low text-on-surface-variant py-2 rounded-sm font-label text-xs font-bold tracking-widest uppercase border border-outline-variant/20"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Goals Section */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-primary" />
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">Objetivos y Actividad</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">Objetivo Principal</label>
              <select 
                value={userProfile?.goal || 'maintain'}
                onChange={(e) => updateBiometric('goal', e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary font-headline font-bold focus:outline-none focus:border-primary uppercase text-xs"
              >
                <option value="lose">Pérdida de Peso</option>
                <option value="maintain">Mantener Peso</option>
                <option value="gain">Ganar Músculo</option>
                <option value="performance">Máximo Rendimiento</option>
              </select>
            </div>
            <div>
              <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">Nivel de Actividad</label>
              <select 
                value={userProfile?.activityLevel || 'moderate'}
                onChange={(e) => updateBiometric('activityLevel', e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary font-headline font-bold focus:outline-none focus:border-primary uppercase text-xs"
              >
                <option value="sedentary">Sedentario</option>
                <option value="light">Ligeramente Activo</option>
                <option value="moderate">Moderadamente Activo</option>
                <option value="very">Muy Activo</option>
                <option value="extra">Extra Activo</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Coach Settings */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-primary" />
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">Asistente IA</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-sm border border-outline-variant/10">
              <div className="flex flex-col">
                <h4 className="font-headline font-bold text-sm uppercase text-tertiary">Botón Flotante de Coach IA</h4>
                <p className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mt-1">
                  {showAIBot ? 'Visible en todas las pantallas' : 'Oculto'}
                </p>
              </div>
              <button 
                onClick={() => setShowAIBot && setShowAIBot(!showAIBot)}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-low ${showAIBot ? 'bg-primary' : 'bg-surface-container'}`}
                role="switch"
                aria-checked={showAIBot}
                aria-label="Alternar Botón Flotante de Coach IA"
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${showAIBot ? 'right-1 bg-on-primary' : 'left-1 bg-on-surface-variant'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Wearable Integrations */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-6">
            <Smartphone className="w-6 h-6 text-primary" />
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">Dispositivos Conectados</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-sm border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-bold text-xs">W</div>
                <div>
                  <h4 className="font-headline font-bold text-sm uppercase text-tertiary">Whoop</h4>
                  <p className={`font-label text-[10px] tracking-widest uppercase ${connectedDevices.whoop ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {connectedDevices.whoop ? 'Conectado' : 'No Conectado'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => toggleDevice('whoop')}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-low ${connectedDevices.whoop ? 'bg-primary' : 'bg-surface-container'}`}
                role="switch"
                aria-checked={connectedDevices.whoop}
                aria-label="Alternar Conexión Whoop"
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${connectedDevices.whoop ? 'right-1 bg-on-primary' : 'left-1 bg-on-surface-variant'}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-sm border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-bold text-xs">O</div>
                <div>
                  <h4 className="font-headline font-bold text-sm uppercase text-tertiary">Oura Ring</h4>
                  <p className={`font-label text-[10px] tracking-widest uppercase ${connectedDevices.oura ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {connectedDevices.oura ? 'Conectado' : 'No Conectado'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => toggleDevice('oura')}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-low ${connectedDevices.oura ? 'bg-primary' : 'bg-surface-container'}`}
                role="switch"
                aria-checked={connectedDevices.oura}
                aria-label="Alternar Conexión Oura Ring"
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${connectedDevices.oura ? 'right-1 bg-on-primary' : 'left-1 bg-on-surface-variant'}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-sm border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">G</div>
                <div>
                  <h4 className="font-headline font-bold text-sm uppercase text-tertiary">Garmin Connect</h4>
                  <p className={`font-label text-[10px] tracking-widest uppercase ${connectedDevices.garmin ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {connectedDevices.garmin ? 'Conectado' : 'No Conectado'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => toggleDevice('garmin')}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-low ${connectedDevices.garmin ? 'bg-primary' : 'bg-surface-container'}`}
                role="switch"
                aria-checked={connectedDevices.garmin}
                aria-label="Alternar Conexión Garmin Connect"
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${connectedDevices.garmin ? 'right-1 bg-on-primary' : 'left-1 bg-on-surface-variant'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Macro Targets */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-primary" />
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">Objetivos Diarios</h3>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-label font-bold tracking-widest uppercase mb-2">
                <span className="text-on-surface-variant">Calorías</span>
                <span className="text-tertiary">{dailyMacros?.target?.cal || 2400} KCAL</span>
              </div>
              <input 
                type="range" 
                min="1500" 
                max="4000" 
                step="50" 
                value={dailyMacros?.target?.cal || 2400} 
                onChange={(e) => setDailyMacros && setDailyMacros((prev: any) => ({ ...prev, target: { ...prev.target, cal: parseInt(e.target.value) } }))}
                className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary" 
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-label font-bold tracking-widest uppercase mb-2">
                <span className="text-on-surface-variant">Proteína</span>
                <span className="text-tertiary">{dailyMacros?.target?.pro || 180}g</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="300" 
                step="5" 
                value={dailyMacros?.target?.pro || 180} 
                onChange={(e) => setDailyMacros && setDailyMacros((prev: any) => ({ ...prev, target: { ...prev.target, pro: parseInt(e.target.value) } }))}
                className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary" 
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-label font-bold tracking-widest uppercase mb-2">
                <span className="text-on-surface-variant">Carbohidratos</span>
                <span className="text-tertiary">{dailyMacros?.target?.carbs || 250}g</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="400" 
                step="5" 
                value={dailyMacros?.target?.carbs || 250} 
                onChange={(e) => setDailyMacros && setDailyMacros((prev: any) => ({ ...prev, target: { ...prev.target, carbs: parseInt(e.target.value) } }))}
                className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-secondary" 
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-label font-bold tracking-widest uppercase mb-2">
                <span className="text-on-surface-variant">Grasas</span>
                <span className="text-tertiary">{dailyMacros?.target?.fats || 65}g</span>
              </div>
              <input 
                type="range" 
                min="30" 
                max="150" 
                step="5" 
                value={dailyMacros?.target?.fats || 65} 
                onChange={(e) => setDailyMacros && setDailyMacros((prev: any) => ({ ...prev, target: { ...prev.target, fats: parseInt(e.target.value) } }))}
                className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-error" 
              />
            </div>
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-6">
            <Leaf className="w-6 h-6 text-primary" />
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">Preferencias Dietéticas</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {dietaryOptions.map(option => (
              <button 
                key={option}
                onClick={() => toggleDietaryPreference(option)}
                className={`px-4 py-2 rounded-full font-label text-xs font-bold tracking-wider uppercase transition-colors border ${
                  userProfile?.dietaryPreferences?.includes(option)
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/30 hover:border-primary/50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-6 h-6 text-primary" />
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">Apariencia</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`relative flex flex-col items-start p-4 rounded-md border-2 transition-all ${
                  theme === t.id 
                    ? 'border-primary bg-surface-container-high' 
                    : 'border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full border border-outline-variant/50" style={{ backgroundColor: t.bg }}></div>
                    <div className="w-6 h-6 rounded-full border border-outline-variant/50 -ml-3" style={{ backgroundColor: t.color }}></div>
                  </div>
                  {theme === t.id && <Check className="w-5 h-5 text-primary" />}
                </div>
                <span className="font-headline font-bold text-sm text-tertiary">{t.name}</span>
                <span className="font-label text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                  {t.id.includes('light') ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                  {t.id.includes('light') ? 'Modo Claro' : 'Modo Oscuro'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-primary" />
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{t.settings.language}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {([
              { id: 'es' as Locale, label: 'Espa\u00f1ol', flag: '\ud83c\uddea\ud83c\uddf8' },
              { id: 'en' as Locale, label: 'English', flag: '\ud83c\uddec\ud83c\udde7' },
            ]).map(lang => (
              <button
                key={lang.id}
                onClick={() => setLocale(lang.id)}
                className={`flex items-center gap-3 p-4 rounded-sm border-2 transition-all ${
                  locale === lang.id
                    ? 'border-primary bg-primary/10'
                    : 'border-outline-variant/30 hover:border-outline-variant'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-headline font-bold text-sm text-tertiary uppercase">{lang.label}</span>
                {locale === lang.id && <Check className="w-5 h-5 text-primary ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button className="w-full py-4 rounded-sm font-headline font-bold text-lg uppercase tracking-widest transition-colors bg-surface-container-highest text-error hover:bg-error/10 flex items-center justify-center gap-2 border border-error/20">
          <LogOut className="w-5 h-5" /> {t.common.delete === 'Delete' ? 'Log Out' : 'Cerrar Sesi\u00f3n'}
        </button>
      </section>
    </div>
  );
}
