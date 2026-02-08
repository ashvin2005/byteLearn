export default function PersonalizeTab() {
  return (
    <div className="p-8 text-white text-center">
      <h2 className="text-3xl font-bold mb-4">Personalize</h2>
      <p className="mb-2">Tune your experience with:</p>
      <ul className="mt-4 space-y-2 text-cyan-200 text-lg">
        <li><span className="font-semibold text-cyan-300">Skill Level</span> adaptation</li>
        <li><span className="font-semibold text-cyan-300">Prompt</span> customization</li>
        <li><span className="font-semibold text-cyan-300">Recommendation System</span></li>
        <li><span className="font-semibold text-cyan-300">Types of Learning</span> (visual, auditory, etc.)</li>
      </ul>
    </div>
  );
}
