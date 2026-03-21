cask "glyph" do
  version "0.2.3"
  sha256 "3cf5b859dd06e2f69901ac4ae2c27b64b5ac2496c965d0829a2ae1a6f35a44e2"

  url "https://github.com/FALAK097/glyph/releases/download/v#{version}/Glyph-#{version}-mac.dmg"
  name "Glyph"
  desc "Minimal markdown viewer and editor"
  homepage "https://github.com/FALAK097/glyph"

  livecheck do
    url :url
    strategy :github_latest
  end

  app "Glyph.app"

  zap trash: [
    "~/Library/Application Support/Glyph",
    "~/Library/Preferences/com.falakgala.glyph.plist",
    "~/Library/Saved Application State/com.falakgala.glyph.savedState",
  ]
end
