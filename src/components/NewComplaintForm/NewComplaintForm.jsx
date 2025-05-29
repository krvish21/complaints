  <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
    <h3 className={`text-xl font-semibold ${theme.accent} mb-6`}>
      Share what's on your mind 💭
    </h3>
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className={`block text-sm font-medium ${theme.text} mb-1`}>
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your note a title..."
          className={`w-full p-2 text-sm border rounded-lg ${theme.border} focus:outline-none focus:ring-2 ring-offset-2 ${theme.text}`}
        />
      </div>
      <div>
        <label htmlFor="description" className={`block text-sm font-medium ${theme.text} mb-1`}>
          Message
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell me more..."
          rows={4}
          className={`w-full p-2 text-sm border rounded-lg ${theme.border} focus:outline-none focus:ring-2 ring-offset-2 ${theme.text}`}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="severity" className={`block text-sm font-medium ${theme.text} mb-1`}>
            How serious is it?
          </label>
          <select
            id="severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className={`w-full p-2 text-sm border rounded-lg ${theme.border} focus:outline-none focus:ring-2 ring-offset-2 ${theme.text}`}
          >
            <option value="low">Just saying</option>
            <option value="medium">We should talk</option>
            <option value="high">Important</option>
          </select>
        </div>
        <div>
          <label htmlFor="category" className={`block text-sm font-medium ${theme.text} mb-1`}>
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`w-full p-2 text-sm border rounded-lg ${theme.border} focus:outline-none focus:ring-2 ring-offset-2 ${theme.text}`}
          >
            <option value="Communication">Communication</option>
            <option value="Quality Time">Quality Time</option>
            <option value="Affection">Affection</option>
            <option value="Support">Support</option>
            <option value="Trust">Trust</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="mood" className={`block text-sm font-medium ${theme.text} mb-1`}>
          How are you feeling?
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {moods.map((mood) => (
            <button
              key={mood}
              type="button"
              onClick={() => setMood(mood)}
              className={`text-2xl p-2 rounded-lg transition-colors ${
                mood === selectedMood
                  ? theme.primary + ' bg-opacity-10'
                  : 'hover:bg-gray-100'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className={`px-4 py-2 ${theme.primary} text-white rounded-lg text-sm shadow-md disabled:opacity-50`}
        >
          Share
        </button>
      </div>
    </form>
  </div> 