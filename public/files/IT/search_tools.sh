#!/usr/bin/env bash
# ============================================================
# 파일 검색 도구 조합 워크플로우 설정
# fd + ripgrep + fzf + bat + zoxide
#
# 사용법:
#   1) 이 파일을 원하는 위치에 저장 (예: ~/.config/search_tools.sh)
#   2) ~/.bashrc (또는 ~/.zshrc) 맨 아래에 아래 한 줄 추가:
#        source ~/.config/search_tools.sh
#   3) 새 터미널을 열거나 `source ~/.bashrc` 실행
#
# bash / zsh 모두에서 동작합니다.
# ============================================================

# ------------------------------------------------------------
# 0. WSL/Ubuntu 환경 alias 보정
#    Ubuntu apt 패키지는 fd, bat이 각각 fdfind, batcat 이름으로 설치됨
# ------------------------------------------------------------
if command -v fdfind >/dev/null 2>&1 && ! command -v fd >/dev/null 2>&1; then
  alias fd='fdfind'
fi
if command -v batcat >/dev/null 2>&1 && ! command -v bat >/dev/null 2>&1; then
  alias bat='batcat'
fi

# ------------------------------------------------------------
# 1. fzf 기본 검색 엔진을 fd로 교체 (Ctrl+T, Alt+C, 기본 fzf 호출에 적용)
# ------------------------------------------------------------
if command -v fd >/dev/null 2>&1; then
  export FZF_DEFAULT_COMMAND='fd --type f --hidden --exclude .git'
  export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"
  export FZF_ALT_C_COMMAND='fd --type d --hidden --exclude .git'
fi

if command -v bat >/dev/null 2>&1; then
  export FZF_CTRL_T_OPTS="--preview 'bat --color=always --style=numbers {}'"
fi

if command -v eza >/dev/null 2>&1; then
  export FZF_ALT_C_OPTS="--preview 'eza --tree --level=2 --color=always {}'"
fi

# fzf 셸 통합 로드 (Ctrl+T, Ctrl+R, Alt+C 활성화)
# 설치 방식에 따라 경로가 다를 수 있어 여러 후보를 순서대로 확인
if command -v fzf >/dev/null 2>&1; then
  if [ -n "$BASH_VERSION" ]; then
    eval "$(fzf --bash 2>/dev/null)" || {
      [ -f ~/.fzf.bash ] && source ~/.fzf.bash
    }
  elif [ -n "$ZSH_VERSION" ]; then
    eval "$(fzf --zsh 2>/dev/null)" || {
      [ -f ~/.fzf.zsh ] && source ~/.fzf.zsh
    }
  fi
fi

# ------------------------------------------------------------
# 2. zoxide 초기화 (cd 대체 + zi 대화형 이동)
# ------------------------------------------------------------
if command -v zoxide >/dev/null 2>&1; then
  if [ -n "$BASH_VERSION" ]; then
    eval "$(zoxide init bash)"
  elif [ -n "$ZSH_VERSION" ]; then
    eval "$(zoxide init zsh)"
  fi
fi

# ------------------------------------------------------------
# 3. 함수: ff — 파일명으로 찾아서 미리보기 후 편집기로 열기
#    사용법: ff
# ------------------------------------------------------------
ff() {
  local file
  file=$(fd --type f --hidden --exclude .git 2>/dev/null \
    | fzf --preview 'bat --color=always --style=numbers {} 2>/dev/null || cat {}') \
    || return
  [ -n "$file" ] && "${EDITOR:-vim}" "$file"
}

# ------------------------------------------------------------
# 4. 함수: fcd — 폴더명으로 찾아서 이동
#    사용법: fcd
# ------------------------------------------------------------
fcd() {
  local dir
  dir=$(fd --type d --hidden --exclude .git 2>/dev/null \
    | fzf --preview 'eza --tree --level=2 --color=always {} 2>/dev/null || ls -la {}') \
    || return
  [ -n "$dir" ] && cd "$dir" || return
}

# ------------------------------------------------------------
# 5. 함수: rgf — 파일 내용 검색 후 해당 줄로 편집기 열기
#    사용법: rgf "검색어"
# ------------------------------------------------------------
rgf() {
  if [ -z "$1" ]; then
    echo "사용법: rgf <검색어>"
    return 1
  fi

  local result file line
  result=$(rg --line-number --no-heading --color=always "$1" 2>/dev/null \
    | fzf --ansi \
          --delimiter ':' \
          --preview 'bat --color=always --highlight-line {2} {1} 2>/dev/null || cat {1}') \
    || return

  [ -z "$result" ] && return

  file=$(echo "$result" | cut -d: -f1)
  line=$(echo "$result" | cut -d: -f2)

  [ -n "$file" ] && "${EDITOR:-vim}" "+$line" "$file"
}

# ------------------------------------------------------------
# 6. 함수: zi — zoxide 기록 중에서 fzf로 골라 이동
#    (zoxide 자체 내장 zi와 겹치므로, 내장 버전이 없을 때만 정의)
# ------------------------------------------------------------
if ! command -v __zoxide_zi >/dev/null 2>&1 && ! type zi >/dev/null 2>&1; then
  zi() {
    local dir
    dir=$(zoxide query -l 2>/dev/null \
      | fzf --preview 'eza --tree --level=2 --color=always {} 2>/dev/null || ls -la {}') \
      || return
    [ -n "$dir" ] && cd "$dir" || return
  }
fi

# ------------------------------------------------------------
# 7. 함수: gco — git 브랜치를 fzf로 골라 체크아웃
#    사용법: gco
# ------------------------------------------------------------
gco() {
  local branch
  branch=$(git branch -a 2>/dev/null | grep -v HEAD | sed 's/^[* ]*//' \
    | fzf --preview 'git log --oneline --graph --color=always {} 2>/dev/null | head -100') \
    || return
  [ -z "$branch" ] && return
  git checkout "${branch#remotes/origin/}"
}

# ------------------------------------------------------------
# 8. 별칭 정리
# ------------------------------------------------------------
if command -v eza >/dev/null 2>&1; then
  alias ls='eza --icons --group-directories-first'
  alias ll='eza -l --icons --group-directories-first'
  alias lt='eza --tree --level=2 --icons'
fi

if command -v bat >/dev/null 2>&1; then
  alias cat='bat --paging=never'
fi

# ============================================================
# 요약
#   ff    : 파일명 검색 → 미리보기 → 편집기로 열기
#   fcd   : 폴더명 검색 → 이동
#   rgf   : 파일 내용 검색 → 해당 줄 미리보기 → 편집기로 열기
#   zi    : 최근/자주 방문 폴더 중 선택 → 이동
#   gco   : git 브랜치 선택 → 체크아웃
#   Ctrl+T: 현재 위치 기준 fd로 파일 찾기 → 커맨드라인에 삽입
#   Ctrl+R: 셸 히스토리 fzf 검색
#   Alt+C : fd로 폴더 찾기 → cd
# ============================================================
